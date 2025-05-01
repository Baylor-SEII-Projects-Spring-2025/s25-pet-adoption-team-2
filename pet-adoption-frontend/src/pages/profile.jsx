// pages/profile.jsx
import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import PetCard from "../Components/PetCard";
import NotificationsTab from "../Components/NotificationsTab";

function TabPanel({ children, value, index, ...other }) {
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
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  // --- State ---
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

  const [myPets, setMyPets] = useState([]);
  const [loadingMyPets, setLoadingMyPets] = useState(false);
  const [myPetsError, setMyPetsError] = useState("");

  // --- Fetch full user on mount ---
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (!stored) return router.push("/login");

    const parsed = JSON.parse(stored);
    const userId = parsed.id || parsed.userId;
    if (!userId) {
      sessionStorage.removeItem("user");
      return router.push("/login");
    }

    fetch(`${BACKEND}/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setUser(data);
        // populate form
        setEmail(data.emailAddress || data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        if (data.userType === "SHELTER") {
          setShelterName(data.shelterName || "");
        } else {
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
        }
        sessionStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => {
        console.error(err);
        sessionStorage.removeItem("user");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [BACKEND, router]);

  // --- Fetch “My Pets” when tab active ---
  const fetchMyPets = useCallback(async () => {
    if (!user?.id) return;
    setLoadingMyPets(true);
    setMyPetsError("");
    setMyPets([]);

    const endpoint =
      user.userType === "SHELTER"
        ? `${BACKEND}/api/pets/shelter/${user.id}`
        : `${BACKEND}/api/pets/adopter/${user.id}`;

    try {
      const token = localStorage.getItem("jwtToken");
const res = await fetch(endpoint, {
  headers: {
    Authorization: token ? `Bearer ${token}` : ""
  }
});
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setMyPets(data || []);
    } catch (err) {
      console.error(err);
      setMyPetsError(err.message);
    } finally {
      setLoadingMyPets(false);
    }
  }, [BACKEND, user]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchMyPets();
    }
  }, [tabValue, fetchMyPets]);

  // --- Handlers ---
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    router.push("/login");
  };
  const handleTabChange = (_, newVal) => setTabValue(newVal);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    setUpdateMessage("");
    setUpdateError("");

    const payload = {
      id: user.id,
      emailAddress: email,
      phone,
      address,
      ...(user.userType === "SHELTER"
        ? { shelterName }
        : { firstName, lastName }),
    };

    try {
      const res = await fetch(`${BACKEND}/api/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
      setUser(data);
      sessionStorage.setItem("user", JSON.stringify(data));
      setUpdateMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setUpdateError(err.message);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!user) return null;

  const isShelter = user.userType === "SHELTER";

  return (
    <>
      <Head>
        <title>My Profile – Pet Adoption</title>
      </Head>
      <main>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3}>
            {/* Header */}
            <Box
              sx={{
                p: 3,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mb: { xs: 2, sm: 0 },
                  mr: { xs: 0, sm: 3 },
                }}
              >
                {(
                  user.emailAddress ||
                  user.email ||
                  ""
                ).charAt(0)
                  .toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {isShelter
                    ? user.shelterName || "Shelter Profile"
                    : `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                      "User Profile"}
                </Typography>
                <Typography variant="subtitle1">
                  {user.emailAddress || user.email}
                </Typography>
                <Typography variant="caption" display="block">
                  Type: {user.userType} — ID: {user.id}
                </Typography>
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="profile tabs"
              >
                <Tab label="Profile Info" />
                <Tab label="My Pets" />
                <Tab label="Edit Profile" />
                <Tab label="Notifications" />
              </Tabs>
            </Box>

            {/* TabPanels */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={user.emailAddress || user.email || "—"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="User Type"
                    secondary={user.userType}
                  />
                </ListItem>
                {isShelter ? (
                  <ListItem>
                    <ListItemText
                      primary="Shelter Name"
                      secondary={user.shelterName || "—"}
                    />
                  </ListItem>
                ) : (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="First Name"
                        secondary={user.firstName || "—"}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Last Name"
                        secondary={user.lastName || "—"}
                      />
                    </ListItem>
                  </>
                )}
                <ListItem>
                  <ListItemText primary="Phone" secondary={user.phone || "—"} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Address"
                    secondary={user.address || "—"}
                  />
                </ListItem>
              </List>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => router.push("/")}>
                  Home
                </Button>
                <Button variant="contained" color="error" onClick={handleLogout}>
                  Logout
                </Button>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                {isShelter ? "Your Listings" : "Your Adopted Pets"}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loadingMyPets ? (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : myPetsError ? (
                <Alert severity="error">{myPetsError}</Alert>
              ) : myPets.length > 0 ? (
                <Grid container spacing={3}>
                  {myPets.map((pet) => (
                    <Grid item xs={12} sm={6} md={4} key={pet.id}>
                      <PetCard pet={pet} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" sx={{ p: 4 }}>
                  <Typography gutterBottom>
                    {isShelter
                      ? "No pets listed yet."
                      : "No adopted pets yet."}
                  </Typography>
                  <Typography color="text.secondary">
                    {isShelter
                      ? "Add pets to your shelter."
                      : "Browse available pets."}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() =>
                      router.push(isShelter ? "/addPet" : "/adopt")
                    }
                  >
                    {isShelter ? "Add a Pet" : "Browse Pets"}
                  </Button>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Edit Profile
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {updateMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {updateMessage}
                </Alert>
              )}
              {updateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {updateError}
                </Alert>
              )}
              <TextField
                fullWidth
                required
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              {isShelter ? (
                <>
                  <TextField
                    fullWidth
                    required
                    label="Shelter Name"
                    value={shelterName}
                    onChange={(e) => setShelterName(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
              <TextField
                fullWidth
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleUpdateProfile}
              >
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
