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
import NotificationsTab from "../Components/NotificationsTab";

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

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shelterName, setShelterName] = useState("");

  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const storedUser = sessionStorage.getItem("user");
      const token = localStorage.getItem("jwtToken");
  
      console.log("Stored User: ", storedUser);  // Check storedUser
      console.log("Token: ", token);  // Check token
  
      if (storedUser && token) {
        const userObj = JSON.parse(storedUser);
        const userId = userObj.id || userObj.userId;
        if (!userId) {
          router.push("/login");
          return;
        }
        fetch(`http://localhost:8080/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch user");
            }
            return response.json();
          })
          .then((data) => {
            setUser(data);
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
            sessionStorage.setItem("user", JSON.stringify(data));
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
            router.push("/login");
          });
      } else {
        console.log("Stored User or Token not found. Redirecting to login.");
        router.push("/login");
      }
    }, 100);  // Delay by 100ms to ensure storage has been populated
  }, [router]);    

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
      const token = localStorage.getItem("jwtToken");
      const response = await fetch("http://localhost:8080/api/user", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        sessionStorage.setItem("user", JSON.stringify(data));
        setUpdateMessage("Profile updated successfully!");
        setUpdateError("");
      } else {
        setUpdateError(data.error || "Failed to update profile");
        setUpdateMessage("");
      }
    } catch (error) {
      setUpdateError("Error updating profile: " + error.message);
      setUpdateMessage("");
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
                <Avatar
                    sx={{ width: 80, height: 80, bgcolor: "secondary.main", mr: 3 }}
                >
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
              {/* Tabs at the top */}
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab label="Profile" />
                  <Tab label="My Pets" />
                  <Tab label="Settings" />
                  <Tab label="Notifications" />
                </Tabs>
              </Box>
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
                          <ListItemText
                              primary="Email Address"
                              secondary={user.email || user.emailAddress}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="User Type" secondary={user.userType} />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                              primary="User ID"
                              secondary={user.id || user.userId}
                          />
                        </ListItem>
                        {user.userType === "SHELTER" ? (
                            <ListItem>
                              <ListItemText
                                  primary="Shelter Name"
                                  secondary={user.shelterName || "Not Provided"}
                              />
                            </ListItem>
                        ) : (
                            <>
                              <ListItem>
                                <ListItemText
                                    primary="First Name"
                                    secondary={user.firstName || "Not Provided"}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                    primary="Last Name"
                                    secondary={user.lastName || "Not Provided"}
                                />
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
                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={() => router.push("/post-animal")}
                        >
                          Post an Animal for Adoption
                        </Button>
                      </>
                  ) : (
                      <>
                        <Typography variant="h6" gutterBottom>No Pets Yet</Typography>
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
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>Account Settings</Typography>
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
              <TabPanel value={tabValue} index={3}>
                <NotificationsTab user={user} />
              </TabPanel>
            </Paper>
          </Container>
        </main>
      </>
  );
}
