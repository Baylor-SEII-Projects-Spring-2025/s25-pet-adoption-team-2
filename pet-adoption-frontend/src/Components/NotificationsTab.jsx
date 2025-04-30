import React, { useState, useEffect } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Box,
  Paper,
  Divider
} from "@mui/material";

export default function NotificationsTab({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyNotification, setReplyNotification] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [approveAdoptionOpen, setApproveAdoptionOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [adoptionMessage, setAdoptionMessage] = useState("");

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  // Helpers
  const isAdoptionRequest = (text) =>
    Boolean(text && text.startsWith("New adoption request"));

  const isAdoptionConfirmation = (text) =>
    text && (
      text.startsWith("Your adoption of") || 
      text.startsWith("Adoption approval:") ||
      text.includes("has been approved!")
    );

  const isShelterResponse = (text) =>
    text && text.startsWith("Shelter response:");

  const isAdopterResponse = (text) =>
    Boolean(text && (
      text.startsWith("Adopter response:") ||
      text.toUpperCase().startsWith("ADOPTER RESPONSE:") ||
      text.startsWith("Response from")
    ));

  // Fetch notifications
  useEffect(() => {
    if (user && user.id) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const ts = new Date().getTime();
      const res = await fetch(`${BACKEND}/api/notifications/user/${user.id}?t=${ts}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      setNotifications(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const res = await fetch(`${BACKEND}/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Reply handlers...
  const handleOpenReply = (notification) => {
    setReplyNotification(notification);
    setReplyMessage("");
    setReplyOpen(true);
  };
  const handleCloseReply = () => {
    setReplyOpen(false);
    setReplyNotification(null);
    setReplyMessage("");
  };
  const handleSendReply = async () => {
    if (!replyMessage.trim()) { alert("Please enter a message"); return; }
    setLoadingNotifications(true);
    try {
      const res = await fetch(`${BACKEND}/api/notifications/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: replyNotification.id, reply: replyMessage })
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== replyNotification.id));
        handleCloseReply();
        alert("Reply sent successfully!");
        fetchNotifications();
      } else {
        const { error } = await res.json();
        alert(error || "Failed to send reply");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Approve adoption handlers
  const handleOpenApproveAdoption = (notification) => {
    // allow both the original request and any adopter responses
    if (
      !isAdoptionRequest(notification.text) &&
      !isAdopterResponse(notification.text)
    ) {
      return;
    }
  
    setSelectedNotification(notification);
    setAdoptionMessage("");
    setApproveAdoptionOpen(true);
  };
  
  const handleCloseApproveAdoption = () => {
    setApproveAdoptionOpen(false);
    setSelectedNotification(null);
    setAdoptionMessage("");
  };
  const handleApproveAdoption = async () => {
    setLoadingNotifications(true);
    try {
      const { id: notificationId, petId, adopterId } = selectedNotification;
      if (!petId || !adopterId) {
        alert("Missing pet or adopter ID on this notification.");
        return;
      }
      const res = await fetch(`${BACKEND}/api/notifications/approve-adoption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, petId, adopterId, shelterId: user.id, message: adoptionMessage })
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        handleCloseApproveAdoption();
        alert("Adoption approved successfully!");
        fetchNotifications();
      } else {
        const { error } = await res.json();
        alert(error || "Failed to approve adoption");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Adopter response to confirmation
  const handleAdopterResponse = async (notification, accepted) => {
    setLoadingNotifications(true);
    try {
      const res = await fetch(`${BACKEND}/api/notifications/adopter-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id, accepted })
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        alert(accepted ? "You've confirmed this adoption!" : "You've declined this adoption offer.");
        fetchNotifications();
      } else {
        const { error } = await res.json();
        alert(error || "Failed to send response");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {user.userType === "SHELTER" ? "Adoption Requests" : "My Notifications"}
        </Typography>
        <Button onClick={fetchNotifications} disabled={loadingNotifications}>
          {loadingNotifications ? "Loading..." : "Refresh"}
        </Button>
      </Stack>

      {sortedNotifications.length ? (
        <List>
          {sortedNotifications.map(notification => (
            <Paper key={notification.id} elevation={2} sx={{ mb:2, p:2, borderLeft: isAdoptionConfirmation(notification.text) ? '4px solid green' : isShelterResponse(notification.text) ? '4px solid blue' : isAdopterResponse(notification.text) ? '4px solid orange' : 'none' }}>
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={isAdoptionConfirmation(notification.text) ? 'bold' : 'normal'}>
                      {notification.text}
                    </Typography>
                  }
                  secondary={<Typography variant="caption">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown date'}</Typography>}
                />
              </ListItem>
              <Divider sx={{ my:1 }} />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => markNotificationAsRead(notification.id)}>Mark as Read</Button>
                {user.userType === "SHELTER" && (
                  <>                   
                    {(isAdopterResponse(notification.text) || isAdoptionRequest(notification.text)) && (
                      <Button onClick={() => handleOpenReply(notification)}>Reply</Button>
                    )}
                    {(isAdoptionRequest(notification.text) || isAdopterResponse(notification.text)) && (
                      <Button variant="contained" color="success" onClick={() => handleOpenApproveAdoption(notification)}>
                        Approve Adoption
                      </Button>
                    )}
                  </>
                )}
                {user.userType !== "SHELTER" && isAdoptionConfirmation(notification.text) && (
                  <>
                    <Button variant="contained" color="success" onClick={() => handleAdopterResponse(notification,true)}>Confirm</Button>
                    <Button color="error" onClick={() => handleAdopterResponse(notification,false)}>Decline</Button>
                  </>
                )}
                {user.userType !== "SHELTER" && isShelterResponse(notification.text) && (
                  <Button onClick={() => handleOpenReply(notification)}>Respond</Button>
                )}
              </Stack>
            </Paper>
          ))}
        </List>
      ) : (
        <Typography>No notifications.</Typography>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onClose={handleCloseReply} fullWidth maxWidth="sm">
        <DialogTitle>Reply to Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>Original message: {replyNotification?.text}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Your Reply"
            fullWidth
            multiline
            rows={4}
            value={replyMessage}
            onChange={e => setReplyMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReply}>Cancel</Button>
          <Button variant="contained" onClick={handleSendReply}>Send Reply</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Adoption Dialog */}
      <Dialog open={approveAdoptionOpen} onClose={handleCloseApproveAdoption} fullWidth maxWidth="sm">
        <DialogTitle>Approve Adoption</DialogTitle>
        <DialogContent>
          <DialogContentText>You are approving the adoption request for: {selectedNotification?.text}</DialogContentText>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt:2 }}>
            This will automatically mark the pet as adopted and send a confirmation to the adopter.
          </Typography>
          <TextField
            margin="dense"
            label="Message to Adopter (Optional)"
            fullWidth
            multiline
            rows={4}
            value={adoptionMessage}
            onChange={e => setAdoptionMessage(e.target.value)}
            placeholder="Add instructions or details about next steps..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveAdoption}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleApproveAdoption}>Approve Adoption</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
