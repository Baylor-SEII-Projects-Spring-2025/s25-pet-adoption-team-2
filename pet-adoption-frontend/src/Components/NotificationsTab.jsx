// components/NotificationsTab.jsx

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
    
    // Manual refresh state
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    // Initial load and manual refresh only - no automatic polling
    useEffect(() => {
        if (user && user.id) {
            fetchNotifications();
        }
    }, [user, refreshTrigger]);

    // Function to manually trigger refresh
    const triggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            // Add a timestamp to prevent caching
            const timestamp = new Date().getTime();
            
            const response = await fetch(`${BACKEND}/api/notifications/user/${user.id}?t=${timestamp}`);
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }
            
            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${BACKEND}/api/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Remove the notification from the list
                setNotifications(notifications.filter((n) => n.id !== notificationId));
                
                // No need to trigger refresh since it should be gone from the server now
            } else {
                console.error("Failed to mark notification as read");
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

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
        if (!replyMessage.trim()) {
            alert("Please enter a message");
            return;
        }
        
        try {
            const response = await fetch(`${BACKEND}/api/notifications/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notificationId: replyNotification.id,
                    reply: replyMessage,
                }),
            });
            
            if (response.ok) {
                // Remove the notification from the list since we've replied to it
                setNotifications(notifications.filter((n) => n.id !== replyNotification.id));
                handleCloseReply();
                
                // Show success message
                alert("Reply sent successfully!");
                
                // Trigger manual refresh after a short delay to see new notifications
                setTimeout(() => {
                    triggerRefresh();
                }, 1000);
            } else {
                const errorText = await response.text();
                alert("Failed to send reply: " + errorText);
            }
        } catch (err) {
            alert("Error sending reply: " + err.message);
        }
    };

    // Functions for adoption approval
    const handleOpenApproveAdoption = (notification) => {
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
        try {
            // Extract pet ID and user ID from notification text
            const notification = selectedNotification;
            
            // Handle both formats:
            // "...for pet 'Raven' (ID: 11602)" or "...for pet ID 11602"
            let petId = null;
            let adopterId = null;
            
            // Try the format with pet name first
            const petNameMatch = notification.text.match(/pet '.*?' \(ID: (\d+)\)/);
            if (petNameMatch) {
                petId = petNameMatch[1];
            } else {
                // Try the format with just "pet ID"
                const petIdMatch = notification.text.match(/pet ID (\d+)/);
                if (petIdMatch) {
                    petId = petIdMatch[1];
                }
            }
            
            // Get the adopter ID
            const userIdMatch = notification.text.match(/from .* \(ID: (\d+)\)/);
            if (userIdMatch) {
                adopterId = userIdMatch[1];
            }
            
            if (!petId || !adopterId) {
                alert("Could not extract pet ID or adopter ID from the notification");
                return;
            }

            const response = await fetch(`${BACKEND}/api/notifications/approve-adoption`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notificationId: notification.id,
                    petId: petId,
                    adopterId: adopterId,
                    shelterId: user.id,
                    message: adoptionMessage
                }),
            });
            
            if (response.ok) {
                // Remove the notification from the list
                setNotifications(notifications.filter((n) => n.id !== notification.id));
                handleCloseApproveAdoption();
                alert("Adoption approval sent successfully!");
                
                // Refresh to get any new notifications
                setTimeout(() => {
                    triggerRefresh();
                }, 1000);
            } else {
                alert("Failed to approve adoption. Please try again.");
            }
        } catch (err) {
            alert("Error approving adoption: " + err.message);
        }
    };

    // Function for adopters to respond to shelter messages
    const handleAdopterResponse = async (notification, accepted) => {
        try {
            const response = await fetch(`${BACKEND}/api/notifications/adopter-response`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notificationId: notification.id,
                    accepted: accepted
                }),
            });
            
            if (response.ok) {
                // Remove the notification from the list
                setNotifications(notifications.filter((n) => n.id !== notification.id));
                alert(accepted ? "You've accepted the adoption offer!" : "You've declined the adoption offer.");
                
                // Refresh to get any new notifications
                setTimeout(() => {
                    triggerRefresh();
                }, 1000);
            } else {
                alert("Failed to send response. Please try again.");
            }
        } catch (err) {
            alert("Error sending response: " + err.message);
        }
    };

    // Helper function to determine if a notification is an adoption approval
    const isAdoptionApproval = (text) => {
        return text && text.startsWith("Adoption approval:");
    };
    
    // Helper function to determine if a notification is from shelter
    const isShelterResponse = (text) => {
        return text && text.startsWith("Shelter response:");
    };
    
    // Helper function to determine if a notification is from adopter
    const isAdopterResponse = (text) => {
        return text && (
            text.startsWith("Adopter response:") || 
            text.startsWith("ADOPTER RESPONSE:") || 
            text.startsWith("Response from adopter:")
        );
    };

    // Get sorted notifications - newest first
    const sortedNotifications = [...notifications]
        .sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0;
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    {user.userType === "SHELTER" ? "Adoption Requests" : "My Notifications"}
                </Typography>
                <Button variant="outlined" onClick={triggerRefresh} disabled={loadingNotifications}>
                    {loadingNotifications ? "Loading..." : "Refresh"}
                </Button>
            </Stack>
            
            {loadingNotifications ? (
                <Typography>Loading notifications...</Typography>
            ) : sortedNotifications.length > 0 ? (
                <List>
                    {sortedNotifications.map((notification) => (
                        <Paper 
                            key={notification.id} 
                            elevation={2} 
                            sx={{ 
                                mb: 2, 
                                p: 2, 
                                borderLeft: isAdoptionApproval(notification.text) 
                                    ? '4px solid green' 
                                    : isShelterResponse(notification.text) 
                                        ? '4px solid blue' 
                                        : isAdopterResponse(notification.text)
                                            ? '4px solid orange'
                                            : 'none' 
                            }}
                        >
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight={isAdoptionApproval(notification.text) ? "bold" : "normal"}>
                                            {notification.text}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="caption" display="block">
                                                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown date'}
                                            </Typography>
                                            {notification.replyText && (
                                                <Box mt={1} p={1} bgcolor="background.paper" borderLeft="3px solid #ccc">
                                                    <Typography variant="body2">
                                                        Reply: {notification.replyText}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                            <Divider sx={{ my: 1 }} />
                            <Stack spacing={1} direction="row" justifyContent="flex-end">
                                <Button variant="outlined" onClick={() => markNotificationAsRead(notification.id)}>
                                    Mark as Read
                                </Button>
                                
                                {/* Shelter user can reply to any adoption request or adopter response */}
                                {user.userType === "SHELTER" && 
                                 (isAdopterResponse(notification.text) || 
                                  (!isAdoptionApproval(notification.text) && !isShelterResponse(notification.text))) && (
                                    <>
                                        <Button variant="outlined" onClick={() => handleOpenReply(notification)}>
                                            Reply
                                        </Button>
                                        {!isAdopterResponse(notification.text) && (
                                            <Button variant="contained" color="success" onClick={() => handleOpenApproveAdoption(notification)}>
                                                Approve Adoption
                                            </Button>
                                        )}
                                    </>
                                )}
                                
                                {/* Adopter user can respond to adoption approval */}
                                {user.userType !== "SHELTER" && isAdoptionApproval(notification.text) && (
                                    <>
                                        <Button variant="contained" color="success" onClick={() => handleAdopterResponse(notification, true)}>
                                            Accept
                                        </Button>
                                        <Button variant="outlined" color="error" onClick={() => handleAdopterResponse(notification, false)}>
                                            Decline
                                        </Button>
                                    </>
                                )}
                                
                                {/* Adopter user can respond to any shelter message */}
                                {user.userType !== "SHELTER" && isShelterResponse(notification.text) && (
                                    <Button variant="outlined" color="primary" onClick={() => handleOpenReply(notification)}>
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
            <Dialog open={replyOpen} onClose={handleCloseReply} fullWidth maxWidth="sm">
                <DialogTitle>Reply to Notification</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Original message: {replyNotification && replyNotification.text}
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
                    <Button onClick={handleCloseReply}>Cancel</Button>
                    <Button onClick={handleSendReply} variant="contained">
                        Send Reply
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Adoption Dialog */}
            <Dialog open={approveAdoptionOpen} onClose={handleCloseApproveAdoption} fullWidth maxWidth="sm">
                <DialogTitle>Approve Adoption</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You are approving the adoption request for: {selectedNotification && selectedNotification.text}
                    </DialogContentText>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                        This will send an official adoption approval to the requester. 
                        They will be able to accept or decline your offer.
                    </Typography>
                    <TextField
                        margin="dense"
                        label="Message to Adopter (Optional)"
                        fullWidth
                        multiline
                        rows={4}
                        value={adoptionMessage}
                        onChange={(e) => setAdoptionMessage(e.target.value)}
                        placeholder="Add instructions or details about next steps..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseApproveAdoption}>Cancel</Button>
                    <Button onClick={handleApproveAdoption} variant="contained" color="success">
                        Approve Adoption
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}