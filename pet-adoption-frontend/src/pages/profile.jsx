import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Container,
  Paper,
  Tab,
  Tabs,
  TextField,
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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [newEmail, setNewEmail] = useState(""); // state for the updated email
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Check for user in session storage
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
      setNewEmail(userObj.email);
    } else {
      // Redirect to login if not logged in
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    // Clear user data from session storage
    sessionStorage.removeItem('user');
    // Redirect to login page
    router.push('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdateEmail = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/user/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send user.userId instead of user.id
        body: JSON.stringify({ id: user.userId, email: newEmail }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        console.log("Email updated successfully:", updatedUser.email);
      } else {
        console.error("Failed to update email");
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };



  if (loading) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Head>
        <title>My Profile - Pet Adoption</title>
      </Head>

      <main>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 0 }}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'secondary.main', mr: 3 }}
              >
                {user.email.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome Back
                </Typography>
                <Typography variant="subtitle1">
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                <Tab label="Profile" />
                <Tab label="My Pets" />
                <Tab label="Settings" />
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
                        <ListItemText primary="Email Address" secondary={user.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Account Type" secondary={user.userType} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="User ID" secondary={user.id} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button variant="outlined" onClick={() => router.push('/')}>
                    Go to Home
                  </Button>
                  <Button variant="contained" color="error" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No Pets Yet
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  You have not adopted any pets yet.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/adopt')}>
                  Browse Available Pets
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography paragraph>
                Update your email address below:
              </Typography>
              <TextField
                label="New Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button variant="contained" onClick={handleUpdateEmail} sx={{ mt: 2 }}>
                Update Email
              </Button>
              <Divider sx={{ my: 2 }} />
              <Typography paragraph>
              </Typography>
            </TabPanel>

          </Paper>
        </Container>
      </main>
    </>
  );
}
