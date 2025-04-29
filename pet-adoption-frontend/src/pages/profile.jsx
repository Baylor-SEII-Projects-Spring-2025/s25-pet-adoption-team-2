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
  Grid,
  CircularProgress,
} from "@mui/material";
import NotificationsTab from "../Components/NotificationsTab";
import PetCard from "../Components/PetCard";

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
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // profile form fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shelterName, setShelterName] = useState("");

  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  // new: shelter's pets
  const [shelterPets, setShelterPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [petsError, setPetsError] = useState("");

  // load user details on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    const userId = u.id || u.userId;
    if (!userId) {
      router.push("/login");
      return;
    }

    fetch(`${backendUrl}/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
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
        sessionStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => {
        console.error(err);
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [backendUrl, router]);

  // whenever the shelter user clicks "My Pets" tab, fetch their pets
  useEffect(() => {
    if (tabValue !== 1 || user?.userType !== "SHELTER") return;

    setLoadingPets(true);
    setPetsError("");

    fetch(`${backendUrl}/api/pets/all`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((allPets) => {
        setShelterPets(
          allPets.filter((p) => p.adoptionCenterId === user.id)
        );
      })
      .catch((err) => setPetsError(err.message))
      .finally(() => setLoadingPets(false));
  }, [tabValue, user, backendUrl]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    router.push("/login");
  };
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdateProfile = () => {
    if (!user) return;
    const userId = user.id || user.userId;
    let payload = { id: userId, email };
    if (user.userType === "SHELTER") {
      payload = { ...payload, shelterName, phone, address };
    } else {
      payload = { ...payload, firstName, lastName, phone, address };
    }
    fetch(`${backendUrl}/api/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setUser(data);
          sessionStorage.setItem("user", JSON.stringify(data));
          setUpdateMessage("Profile updated successfully!");
          setUpdateError("");
        } else {
          throw new Error(data.error || "Update failed");
        }
      })
      .catch((err) => {
        setUpdateError(err.message);
        setUpdateMessage("");
      });
  };

  if (loading) {
    return (
      <Container
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading…</Typography>
      </Container>
    );
  }
  if (!user) return null;

  return (
    <>
      <Head>
        <title>My Profile – Pet Adoption</title>
      </Head>
      <main>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper elevation={3}>
            {/* header */}
            <Box
              sx={{
                p: 3,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
                {(user.email || user.emailAddress || "")
                  .charAt(0)
                  .toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4">Welcome Back</Typography>
                <Typography variant="subtitle1">
                  {user.email || user.emailAddress}
                </Typography>
              </Box>
            </Box>

            {/* tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Profile" />
                <Tab label="My Pets" />
                <Tab label="Settings" />
                <Tab label="Notifications" />
              </Tabs>
            </Box>

            {/* Profile Info */}
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
                        <ListItemText
                          primary="User Type"
                          secondary={user.userType}
                        />
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
                        <ListItemText
                          primary="Phone"
                          secondary={user.phone || "—"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Address"
                          secondary={user.address || "—"}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" onClick={() => router.push("/")}>
                    Go to Home
                  </Button>
                  <Button variant="contained" color="error" onClick={handleLogout}>
                    Logout
                  </Button>
                </Stack>
              </Stack>
            </TabPanel>

            {/* My Pets (for shelters) */}
            <TabPanel value={tabValue} index={1}>
                {user.userType === "SHELTER" ? (
                  // ——— Shelter’s “My Pets” ———
                  loadingPets ? (
                    <Box sx={{ textAlign: "center", p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : petsError ? (
                    <Alert severity="error">{petsError}</Alert>
                  ) : shelterPets.length > 0 ? (
                    <Grid container spacing={3}>
                      {shelterPets.map((pet) => (
                        <Grid item xs={12} sm={6} md={4} key={pet.id}>
                          <PetCard pet={pet} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box textAlign="center" sx={{ p: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        You haven’t posted any animals yet.
                      </Typography>
                      <Typography color="text.secondary">
                        Start sharing your available pets with adopters.
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => router.push("/addPet")}
                      >
                        Post an Animal
                      </Button>
                    </Box>
                  )
                ) : (
                  // ——— Adopter’s “My Pets” ———
                  <Box textAlign="center" sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      You haven’t adopted any pets yet.
                    </Typography>
                    <Typography color="text.secondary">
                      Browse our available pets and find your new best friend!
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => router.push("/adopt")}
                    >
                      Browse Available Pets
                    </Button>
                  </Box>
                )}
            </TabPanel>


            {/* Settings */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {updateMessage && <Alert severity="success">{updateMessage}</Alert>}
              {updateError && <Alert severity="error">{updateError}</Alert>}

              <TextField
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
              />

              {user.userType === "SHELTER" ? (
                <>
                  <TextField
                    fullWidth
                    label="Shelter Name"
                    value={shelterName}
                    onChange={(e) => setShelterName(e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    margin="normal"
                  />
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    margin="normal"
                  />
                </>
              )}

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleUpdateProfile}
              >
                Save Changes
              </Button>
            </TabPanel>

            {/* Notifications */}
            <TabPanel value={tabValue} index={3}>
              <NotificationsTab user={user} />
            </TabPanel>
          </Paper>
        </Container>
      </main>
    </>
  );
}
