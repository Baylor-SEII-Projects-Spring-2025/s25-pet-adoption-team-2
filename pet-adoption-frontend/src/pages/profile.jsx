import React, { useState, useEffect, useCallback } from "react";
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
import NotificationsTab from "../Components/NotificationsTab"; // Ensure this path is correct
import PetCard from "../Components/PetCard"; // Ensure this path is correct

// Helper component for Tabs
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

  // User and loading state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0); // Default to Profile tab

  // Profile form fields state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shelterName, setShelterName] = useState("");

  // Update status messages
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  // State for pets displayed in "My Pets" tab
  const [myPets, setMyPets] = useState([]); // Combined state for shelter's or adopter's pets
  const [loadingMyPets, setLoadingMyPets] = useState(false);
  const [myPetsError, setMyPetsError] = useState("");

  // --- Fetch User Details ---
  useEffect(() => {
    setLoading(true);
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    const userId = parsedUser?.id || parsedUser?.userId; // Handle potential variations in ID key

    if (!userId) {
      console.error("User ID missing from session storage.");
      sessionStorage.removeItem("user"); // Clear invalid session data
      router.push("/login");
      return;
    }

    // Fetch full user details from backend to ensure data is up-to-date
    fetch(`${backendUrl}/users/${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: Failed to fetch user details.`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data) {
            // Handle case where backend returns null/empty for a valid ID (shouldn't happen ideally)
            throw new Error("User data not found on backend.");
        }
        setUser(data); // Set the full user object
        // Populate form fields
        setEmail(data.emailAddress || data.email || ""); // Handle potential variations
        setPhone(data.phone || "");
        setAddress(data.address || "");
        if (data.userType === "SHELTER") {
          setShelterName(data.shelterName || "");
        } else {
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
        }
        // Update session storage with potentially newer data from backend
        sessionStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => {
        console.error("Error fetching user details:", err);
        // Clear session and redirect to login if fetch fails
        sessionStorage.removeItem("user");
        setUser(null); // Clear user state
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [backendUrl, router]); // Rerun if backendUrl or router changes (usually stable)

  // --- Fetch Pets for "My Pets" Tab ---
  const fetchMyPets = useCallback(async () => {
    if (!user || !user.id) return; // Ensure user and user ID are available

    setLoadingMyPets(true);
    setMyPetsError("");
    setMyPets([]); // Clear previous pets

    const userId = user.id;
    let endpoint = "";

    // Determine the correct endpoint based on user type
    if (user.userType === "SHELTER") {
      endpoint = `${backendUrl}/api/pets/shelter/${userId}`;
      console.log(`Fetching pets for Shelter ID: ${userId} from ${endpoint}`);
    } else { // Assume ADOPTER or other non-shelter types
      endpoint = `${backendUrl}/api/pets/adopter/${userId}`;
      console.log(`Fetching adopted pets for Adopter ID: ${userId} from ${endpoint}`);
    }

    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setMyPets(data || []); // Set pets, ensure it's an array even if response is null
      console.log("Fetched 'My Pets':", data);
    } catch (err) {
      console.error(`Error fetching 'My Pets' from ${endpoint}:`, err);
      setMyPetsError(`Failed to load pets: ${err.message}`);
    } finally {
      setLoadingMyPets(false);
    }
  }, [user, backendUrl]); // Depend on user and backendUrl

  // Trigger fetchMyPets when the "My Pets" tab is selected (and user is loaded)
  useEffect(() => {
    // Only fetch if the "My Pets" tab (index 1) is active and user data is available
    if (tabValue === 1 && user && user.id) {
      fetchMyPets();
    }
  }, [tabValue, user, fetchMyPets]); // Rerun when tab, user, or the fetch function changes

  // --- Event Handlers ---
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null); // Clear user state
    router.push("/login");
  };

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
    // Fetching for the "My Pets" tab is handled by the useEffect hook above
  };

  const handleUpdateProfile = async () => {
    if (!user || !user.id) return;

    setUpdateMessage("");
    setUpdateError("");

    const userId = user.id;
    let payload = {
        id: userId,
        // Include fields common to all or conditionally add them
        emailAddress: email, // Use consistent field name
        phone: phone,
        address: address,
    };

    // Add type-specific fields
    if (user.userType === "SHELTER") {
      payload.shelterName = shelterName;
    } else { // ADOPTER or other types
      payload.firstName = firstName;
      payload.lastName = lastName;
    }

    console.log("Updating profile with payload:", payload);

    try {
        const res = await fetch(`${backendUrl}/api/user`, { // Endpoint from UserEndpoint.java
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json(); // Attempt to parse JSON regardless of status

        if (!res.ok) {
            throw new Error(data.error || `HTTP error ${res.status}`);
        }

        // Update successful
        setUser(data); // Update local user state with response from backend
        sessionStorage.setItem("user", JSON.stringify(data)); // Update session storage
        setUpdateMessage("Profile updated successfully!");
        console.log("Profile update successful:", data);

    } catch (err) {
        console.error("Profile update failed:", err);
        setUpdateError(`Update failed: ${err.message}`);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If loading is finished but user is still null (e.g., fetch failed, redirecting)
  if (!user) {
     return (
        <Container sx={{ textAlign: 'center', mt: 5 }}>
            <Typography>Redirecting to login...</Typography>
        </Container>
     );
  }

  // Determine user type for conditional rendering
  const isShelter = user.userType === "SHELTER";
  // REMOVED: const isAdopter = !isShelter; // This variable was unused

  return (
    <>
      <Head>
        <title>My Profile – Pet Adoption</title>
      </Head>
      <main>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3}>
            {/* Profile Header */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 }, // Responsive padding
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                flexDirection: { xs: 'column', sm: 'row' }, // Stack on small screens
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              <Avatar sx={{ width: 80, height: 80, mb: { xs: 2, sm: 0 }, mr: { xs: 0, sm: 3 } }}>
                {(user.emailAddress || user.email || "U").charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1">
                  {isShelter // Use isShelter directly
                    ? user.shelterName || "Shelter Profile"
                    : `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User Profile"}
                </Typography>
                <Typography variant="subtitle1">
                  {user.emailAddress || user.email}
                </Typography>
                 <Typography variant="caption" display="block">
                   User Type: {user.userType} (ID: {user.id})
                 </Typography>
              </Box>
            </Box>

            {/* Tabs Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable" // Allow scrolling on smaller screens
                scrollButtons="auto" // Show scroll buttons automatically
                aria-label="Profile sections"
              >
                <Tab label="Profile Info" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
                <Tab label="My Pets" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
                <Tab label="Edit Profile" id="profile-tab-2" aria-controls="profile-tabpanel-2" />
                <Tab label="Notifications" id="profile-tab-3" aria-controls="profile-tabpanel-3" />
              </Tabs>
            </Box>

            {/* Tab Panels */}

            {/* Profile Info Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Account Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense> {/* Use dense for slightly smaller spacing */}
                <ListItem>
                  <ListItemText primary="Email Address" secondary={user.emailAddress || user.email || "—"} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="User Type" secondary={user.userType || "—"} />
                </ListItem>
                {isShelter ? ( // Use isShelter
                  <ListItem>
                    <ListItemText primary="Shelter Name" secondary={user.shelterName || "Not Set"} />
                  </ListItem>
                ) : (
                  <>
                    <ListItem>
                      <ListItemText primary="First Name" secondary={user.firstName || "Not Set"} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Last Name" secondary={user.lastName || "Not Set"} />
                    </ListItem>
                  </>
                )}
                <ListItem>
                  <ListItemText primary="Phone" secondary={user.phone || "Not Set"} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Address" secondary={user.address || "Not Set"} />
                </ListItem>
              </List>
               <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={() => router.push("/")}>Go to Home</Button>
                  <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
                </Stack>
            </TabPanel>

            {/* My Pets Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                {isShelter ? "Pets Listed by You" : "Your Adopted Pets"} {/* Use isShelter */}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {loadingMyPets ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : myPetsError ? (
                <Alert severity="error">{myPetsError}</Alert>
              ) : myPets.length > 0 ? (
                <Grid container spacing={3}>
                  {myPets.map((pet) => (
                    <Grid item xs={12} sm={6} md={4} key={pet.id}>
                      {/* Pass the whole pet object to PetCard */}
                      <PetCard pet={pet} />
                      {/* Add any specific actions for owned/adopted pets if needed */}
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // Empty state message
                <Box textAlign="center" sx={{ p: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {isShelter // Use isShelter
                      ? "You haven't listed any pets yet."
                      : "You haven't adopted any pets yet."}
                  </Typography>
                  <Typography color="text.secondary">
                    {isShelter // Use isShelter
                      ? "Add pets to make them available for adoption."
                      : "Ready to find your new best friend?"}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => router.push(isShelter ? "/addPet" : "/adopt")} // Use isShelter
                  >
                    {isShelter ? "Add a Pet" : "Browse Available Pets"} {/* Use isShelter */}
                  </Button>
                </Box>
              )}
            </TabPanel>

            {/* Edit Profile Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Edit Your Profile</Typography>
              <Divider sx={{ mb: 2 }} />
              {/* Display update status messages */}
              {updateMessage && <Alert severity="success" sx={{ mb: 2 }}>{updateMessage}</Alert>}
              {updateError && <Alert severity="error" sx={{ mb: 2 }}>{updateError}</Alert>}

              <TextField
                fullWidth required
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }} // Keep label floated
              />

              {isShelter ? ( // Use isShelter
                <>
                  <TextField
                    fullWidth required
                    label="Shelter Name"
                    value={shelterName}
                    onChange={(e) => setShelterName(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
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
                </>
              ) : ( // Adopter fields
                <>
                  <TextField
                    fullWidth required
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth required
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
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

            {/* Notifications Tab */}
            <TabPanel value={tabValue} index={3}>
              {/* Pass the user object to the NotificationsTab component */}
              {/* Ensure user object is fully loaded before rendering NotificationsTab */}
              {user && <NotificationsTab user={user} />}
            </TabPanel>

          </Paper>
        </Container>
      </main>
    </>
  );
}
