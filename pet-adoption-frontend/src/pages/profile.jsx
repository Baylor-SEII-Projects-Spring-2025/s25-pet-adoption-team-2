import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Container,
  Paper,
  Tab,
  Tabs,
  TextField,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Box,
  Alert,
} from "@mui/material";

// Simple TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`profile-tabpanel-${index}`}
          aria-labelledby={`profile-tab-${index}`}
          {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
  );
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // State variables for profile fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shelterName, setShelterName] = useState("");

  // State for update messages
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  // State for notifications (only used for Adoption Center accounts)
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch latest user info from backend on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      const userId = userObj.id || userObj.userId;
      if (!userId) {
        router.push("/login");
        return;
      }
      // Fetch latest user info from backend
      fetch(`http://localhost:8080/users/${userId}`)
          .then((response) => response.json())
          .then((data) => {
            setUser(data);
            // Update fields from backend data
            setEmail(data.emailAddress || data.email);
            if (data.userType === "SHELTER") {
              setShelterName(data.shelterName || "");
            } else {
              setFirstName(data.firstName || "");
              setLastName(data.lastName || "");
            }
            setPhone(data.phone || "");
            setAddress(data.address || "");
            setLoading(false);
            // Also update session storage with fresh data
            sessionStorage.setItem("user", JSON.stringify(data));
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
            router.push("/login");
          });
    } else {
      router.push("/login");
    }
  }, [router]);

  // When the Adoption Center's Notifications tab is selected, fetch notifications
  useEffect(() => {
    if (user && user.userType === "SHELTER" && tabValue === 3) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tabValue]);

  // Function to fetch unread notifications for the Adoption Center account
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      // This endpoint should return unread notifications for a specific user.
      // Adjust the URL as necessary for your backend.
      const response = await fetch(`http://localhost:8080/api/notifications/user/${user.id}`);
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      // Assuming your endpoint to mark a notification as read uses a POST call.
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: "POST",
      });
      if (response.ok) {
        // Remove the notification from the list after marking as read
        setNotifications(notifications.filter((n) => n.id !== notificationId));
      } else {
        console.error("Failed to mark notification as read");
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    router.push("/login");
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const userId = user.id || user.userId;
    if (!userId) {
      setUpdateError("User ID is missing in stored user object");
      return;
    }

    let updatePayload = { id: userId, email };

    if (user.userType === "SHELTER") {
      updatePayload.shelterName = shelterName;
      updatePayload.phone = phone;
      updatePayload.address = address;
    } else {
      updatePayload.firstName = firstName;
      updatePayload.lastName = lastName;
      updatePayload.phone = phone;
      updatePayload.address = address;
    }

    try {
      const response = await fetch("http://localhost:8080/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        sessionStorage.setItem("user", JSON.stringify(data));
        setUpdateMessage("Profile updated successfully!");
        setUpdateError("");
        console.log("Profile updated successfully", data);
      } else {
        setUpdateError(data.error || "Failed to update profile");
        setUpdateMessage("");
        console.error("Failed to update profile:", data.error);
      }
    } catch (error) {
      setUpdateError("Error updating profile: " + error.message);
      setUpdateMessage("");
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
        <Container
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
        >
          <Typography>Loading...</Typography>
        </Container>
    );
  }

  if (!user) return null;

  return (
      <>
        <Head>
          <title>My Profile - Pet Adoption</title>
        </Head>
        <main>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper elevation={3}>
              <Box
                  sx={{
                    p: 3,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                  }}
              >
                <Avatar sx={{ width: 80, height: 80, bgcolor: "secondary.main", mr: 3 }}>
                  {(user.email || user.emailAddress || "").charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Welcome Back
                  </Typography>
                  <Typography variant="subtitle1">
                    {user.email || user.emailAddress}
                  </Typography>
                </Box>
              </Box>

              {/* Tabs at the top of the profile */}
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab label="Profile" />
                  <Tab label="My Pets" />
                  <Tab label="Settings" />
                  {/* Only show the Notifications tab for Adoption Center accounts */}
                  {user.userType === "SHELTER" && <Tab label="Notifications" />}
                </Tabs>
              </Box>

              {/* Profile Tab Panel */}
              <TabPanel value={tabValue} index={0}>
                <Stack spacing={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Account Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <List>
                        <ListItem>
                          <ListItemText primary="Email Address" secondary={user.email || user.emailAddress} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="User Type" secondary={user.userType} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="User ID" secondary={user.id || user.userId} />
                        </ListItem>
                        {user.userType === "SHELTER" ? (
                            <ListItem>
                              <ListItemText primary="Shelter Name" secondary={user.shelterName || "Not Provided"} />
                            </ListItem>
                        ) : (
                            <>
                              <ListItem>
                                <ListItemText primary="First Name" secondary={user.firstName || "Not Provided"} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary="Last Name" secondary={user.lastName || "Not Provided"} />
                              </ListItem>
                            </>
                        )}
                        <ListItem>
                          <ListItemText primary="Phone" secondary={user.phone || "Not Provided"} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Address" secondary={user.address || "Not Provided"} />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                  <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Button variant="outlined" onClick={() => router.push("/")}>
                      Go to Home
                    </Button>
                    <Button variant="contained" color="error" onClick={handleLogout}>
                      Logout
                    </Button>
                  </Stack>
                </Stack>
              </TabPanel>

              {/* My Pets Tab Panel */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3, textAlign: "center" }}>
                  {user.userType === "SHELTER" ? (
                      <>
                        <Typography variant="h6" gutterBottom>
                          You have not posted any animals for adoption yet.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Start sharing your available animals with potential adopters.
                        </Typography>
                        <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push("/post-animal")}>
                          Post an Animal for Adoption
                        </Button>
                      </>
                  ) : (
                      <>
                        <Typography variant="h6" gutterBottom>
                          No Pets Yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          You have not adopted any pets yet.
                        </Typography>
                        <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push("/adopt")}>
                          Browse Available Pets
                        </Button>
                      </>
                  )}
                </Box>
              </TabPanel>

              {/* Settings Tab Panel */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {updateMessage && <Alert severity="success">{updateMessage}</Alert>}
                {updateError && <Alert severity="error">{updateError}</Alert>}

                <TextField
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                {user.userType === "SHELTER" ? (
                    <>
                      <TextField
                          label="Shelter Name"
                          value={shelterName}
                          onChange={(e) => setShelterName(e.target.value)}
                          fullWidth
                          margin="normal"
                          required
                      />
                      <TextField
                          label="Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          fullWidth
                          margin="normal"
                      />
                      <TextField
                          label="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          fullWidth
                          margin="normal"
                      />
                    </>
                ) : (
                    <>
                      <TextField
                          label="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          fullWidth
                          margin="normal"
                      />
                      <TextField
                          label="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          fullWidth
                          margin="normal"
                      />
                      <TextField
                          label="Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          fullWidth
                          margin="normal"
                      />
                      <TextField
                          label="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          fullWidth
                          margin="normal"
                      />
                    </>
                )}
                <Button variant="contained" onClick={handleUpdateProfile} sx={{ mt: 2 }}>
                  Save Changes
                </Button>
              </TabPanel>

              {/* Notifications Tab Panel (only rendered for Adoption Center accounts) */}
              {user.userType === "SHELTER" && (
                  <TabPanel value={tabValue} index={3}>
                    <Typography variant="h6" gutterBottom>
                      Unread Notifications
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
                                <Button
                                    variant="outlined"
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                  Mark as Read
                                </Button>
                              </ListItem>
                          ))}
                        </List>
                    ) : (
                        <Typography>No unread notifications.</Typography>
                    )}
                  </TabPanel>
              )}
            </Paper>
          </Container>
        </main>
      </>
  );
}
