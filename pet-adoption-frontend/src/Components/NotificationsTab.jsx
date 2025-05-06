// components/NotificationsTab.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  const [loading, setLoading] = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyNotification, setReplyNotification] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveNotification, setApproveNotification] = useState(null);
  const [approveMessage, setApproveMessage] = useState("");

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080";
  const token = localStorage.getItem("jwtToken");
  
  // Use useMemo to prevent the authHeader from changing on every render
  const authHeader = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // Helpers for notification types
  const isAdoptionRequest = (text) =>
    Boolean(text?.startsWith("New adoption request"));
    
  const isAdopterResponse = (text) =>
    Boolean(
      text?.startsWith("Adopter response:") ||
      text?.toUpperCase().startsWith("ADOPTER RESPONSE:") ||
      text?.startsWith("Response from")
    );
    
  const isAdoptionConfirmation = (text) =>
    text?.startsWith("Your adoption of") ||
    text?.startsWith("Adoption approval:") ||
    text?.includes("has been approved!");
    
  const isShelterResponse = (text) => text?.startsWith("Shelter response:");

  // Define fetchNotifications with useCallback BEFORE using it in useEffect
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const ts = new Date().getTime();
      const res = await fetch(
        `${BACKEND}/api/notifications/user/${user?.id}?t=${ts}`,
        { headers: authHeader }
      );
      if (!res.ok) throw new Error("Failed to fetch notifications");
      setNotifications(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, BACKEND, authHeader]); // Using optional chaining for user?.id

  // Only keep one useEffect to avoid duplicate calls
  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(
        `${BACKEND}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: authHeader
        }
      );
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Reply Handlers ---
  const openReply = (notification) => {
    setReplyNotification(notification);
    setReplyMessage("");
    setReplyOpen(true);
  };
  const closeReply = () => {
    setReplyOpen(false);
    setReplyNotification(null);
    setReplyMessage("");
  };
  const sendReply = async () => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/notifications/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader
        },
        body: JSON.stringify({
          notificationId: replyNotification.id,
          reply: replyMessage
        })
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== replyNotification.id)
        );
        closeReply();
        fetchNotifications();
      } else {
        const { error } = await res.json();
        alert(error || "Failed to send reply");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Approve Adoption Handlers ---
  const openApprove = (notification) => {
    // Only for requests or adopter responses
    if (
      !isAdoptionRequest(notification.text) &&
      !isAdopterResponse(notification.text)
    ) {
      return;
    }
    setApproveNotification(notification);
    setApproveMessage("");
    setApproveOpen(true);
  };
  const closeApprove = () => {
    setApproveOpen(false);
    setApproveNotification(null);
    setApproveMessage("");
  };
  const approveAdoption = async () => {
    setLoading(true);
    try {
      const { id, petId, adopterId } = approveNotification;
      if (!petId || !adopterId) {
        alert("Missing pet or adopter ID");
        return;
      }
      const res = await fetch(`${BACKEND}/api/notifications/approve-adoption`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader
        },
        body: JSON.stringify({
          notificationId: id,
          petId,
          adopterId,
          shelterId: user.id,
          message: approveMessage
        })
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== id)
        );
        closeApprove();
        fetchNotifications();
      } else {
        const { error } = await res.json();
        alert(error || "Failed to approve adoption");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort newest first
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">
          {user.userType === "SHELTER"
            ? "Adoption Requests"
            : "My Notifications"}
        </Typography>
        <Button onClick={fetchNotifications} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </Stack>

      {sorted.length ? (
        <List>
          {sorted.map((n) => (
            <Paper
              key={n.id}
              elevation={2}
              sx={{
                mb: 2,
                p: 2,
                borderLeft: isAdoptionConfirmation(n.text)
                  ? "4px solid green"
                  : isShelterResponse(n.text)
                  ? "4px solid blue"
                  : isAdopterResponse(n.text)
                  ? "4px solid orange"
                  : "none"
              }}
            >
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight={
                        isAdoptionConfirmation(n.text) ? "bold" : "normal"
                      }
                    >
                      {n.text}
                    </Typography>
                  }
                  secondary={
                    n.createdAt
                      ? new Date(n.createdAt).toLocaleString()
                      : "Unknown date"
                  }
                />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => markAsRead(n.id)}>
                  Mark as Read
                </Button>

                {user.userType === "SHELTER" && (
                  <>
                    {(isAdoptionRequest(n.text) ||
                      isAdopterResponse(n.text)) && (
                      <Button onClick={() => openReply(n)}>Reply</Button>
                    )}
                    {(isAdoptionRequest(n.text) ||
                      isAdopterResponse(n.text)) && (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => openApprove(n)}
                      >
                        Approve Adoption
                      </Button>
                    )}
                  </>
                )}

                {user.userType !== "SHELTER" &&
                  isShelterResponse(n.text) && (
                    <Button onClick={() => openReply(n)}>
                      Respond
                    </Button>
                  )}
              </Stack>
            </Paper>
          ))}
        </List>
      ) : (
        <Typography>No notifications.</Typography>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onClose={closeReply} fullWidth maxWidth="sm">
        <DialogTitle>Reply to Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Original message: {replyNotification?.text}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Your Reply"
            fullWidth
            multiline
            rows={4}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReply}>Cancel</Button>
          <Button variant="contained" onClick={sendReply}>
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Adoption Dialog */}
      <Dialog open={approveOpen} onClose={closeApprove} fullWidth maxWidth="sm">
        <DialogTitle>Approve Adoption</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are approving: {approveNotification?.text}
          </DialogContentText>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ mt: 2 }}
          >
            This will mark the pet adopted and notify the adopter.
          </Typography>
          <TextField
            margin="dense"
            label="Message to Adopter (Optional)"
            fullWidth
            multiline
            rows={4}
            value={approveMessage}
            onChange={(e) => setApproveMessage(e.target.value)}
            placeholder="Any next-step instructions…"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApprove}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={approveAdoption}
          >
            Approve Adoption
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}