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
    Box
} from "@mui/material";

export default function NotificationsTab({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyNotification, setReplyNotification] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");

    useEffect(() => {
        if (user && user.id) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/user/${user.id}`);
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
            const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Remove the notification from the list
                setNotifications(notifications.filter((n) => n.id !== notificationId));
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
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notificationId: replyNotification.id,
                    reply: replyMessage,
                }),
            });
            if (response.ok) {
                setNotifications(notifications.filter((n) => n.id !== replyNotification.id));
                handleCloseReply();
            } else {
                console.error("Failed to send reply");
            }
        } catch (err) {
            console.error("Error sending reply:", err);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                {user.userType === "SHELTER" ? "Adoption Requests" : "My Notifications"}
            </Typography>
            {loadingNotifications ? (
                <Typography>Loading notifications...</Typography>
            ) : notifications.length > 0 ? (
                <List>
                    {notifications.map((notification) => (
                        <ListItem key={notification.id} divider>
                            <ListItemText
                                primary={notification.text}
                                secondary={new Date(notification.createdAt).toLocaleString()}
                            />
                            <Stack spacing={1} direction="row">
                                <Button variant="outlined" onClick={() => markNotificationAsRead(notification.id)}>
                                    Mark as Read
                                </Button>
                                {user.userType === "SHELTER" && (
                                    <Button variant="outlined" onClick={() => handleOpenReply(notification)}>
                                        Reply
                                    </Button>
                                )}
                            </Stack>
                        </ListItem>
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
        </Box>
    );
}
