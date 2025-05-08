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
  IconButton, 
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete'; 
import PetCard from "../Components/PetCard"; 
import NotificationsTab from "../Components/NotificationsTab"; 

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminDashboard({ user, BACKEND }) {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [pets, setPets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); 

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
    setError(''); 
  };

  const getToken = () => localStorage.getItem("jwtToken");

  const fetchAllPets = useCallback(async () => {
    setLoadingPets(true);
    setError('');
    const token = getToken();
    if (!token) {
      setError('Authentication token not found.');
      setLoadingPets(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND}/api/admin/pets`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Pet fetch failed (${res.status}): ${await res.text()}`);
      const data = await res.json();
      setPets(data.content || data || []);
    } catch (err) {
      console.error("Pet fetch error:", err);
      setError(`Failed to load pets: ${err.message}`);
      setPets([]);
    } finally {
      setLoadingPets(false);
    }
  }, [BACKEND]);

  const fetchAllUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError('');
    const token = getToken();
     if (!token) {
      setError('Authentication token not found.');
      setLoadingUsers(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`User fetch failed (${res.status}): ${await res.text()}`);
      const data = await res.json();
      setUsers((data || []).filter(u => u.id !== user.id));
    } catch (err) {
      console.error("User fetch error:", err);
      setError(`Failed to load users: ${err.message}`);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [BACKEND, user?.id]);

  const handleDeletePet = async (petId) => {
    if (!window.confirm(`Are you sure you want to permanently delete pet ID ${petId}? This action cannot be undone.`)) return;
    setError('');
    setActionLoading(`pet-${petId}`);
    const token = getToken();
    if (!token) {
       setError('Authentication token not found.');
       setActionLoading(null);
       return;
     }
    try {
       
      const res = await fetch(`${BACKEND}/api/admin/pets/${petId}`, { 
         method: 'DELETE',
         headers: { Authorization: `Bearer ${token}` }
       });
      if (!res.ok) throw new Error(`Delete failed (${res.status}): ${await res.text()}`);
      alert('Pet deleted successfully!');
      fetchAllPets();
    } catch (err) {
      console.error("Delete pet error:", err);
      setError(`Failed to delete pet ID ${petId}: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userIdToDelete, userEmail) => {
     if (userIdToDelete === user.id) {
       alert("You cannot delete your own account from this interface.");
       return;
     }
     if (!window.confirm(`Are you sure you want to permanently delete user ${userEmail} (ID: ${userIdToDelete})? This action cannot be undone.`)) return;
     setError('');
     setActionLoading(`user-${userIdToDelete}`);
     const token = getToken();
     if (!token) {
        setError('Authentication token not found.');
        setActionLoading(null);
        return;
      }
     try {
        const res = await fetch(`${BACKEND}/api/admin/users/${userIdToDelete}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Delete failed (${res.status}): ${await res.text()}`);
        alert(`User ${userEmail} deleted successfully!`);
        fetchAllUsers(); 
      } catch (err) {
        console.error("Delete user error:", err);
        setError(`Failed to delete user ID ${userIdToDelete}: ${err.message}`);
      } finally {
         setActionLoading(null);
      }
  };

  useEffect(() => {
    if (tabValue === 0) fetchAllPets();
    else if (tabValue === 1) fetchAllUsers();
  }, [tabValue, fetchAllPets, fetchAllUsers]);

  const getUserDisplayName = (u) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      return name || u.emailAddress || 'Unnamed User';
  }
  const getPetDisplayName = (p) => p.name || 'Unnamed Pet';


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText', display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h4">Admin Dashboard</Typography>
            <Typography variant="subtitle1">Welcome, {getUserDisplayName(user)}!</Typography>
          </Box>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => router.push('/adopt')}
            sx={{ ml: 2 }}
          >
            Browse Pets
          </Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
            <Tab label="Manage Pets" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
            <Tab label="Manage Users" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
          </Tabs>
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        <TabPanel value={tabValue} index={0} id="admin-tabpanel-0" aria-labelledby="admin-tab-0">
           <Typography variant="h6" gutterBottom>Pet Listings</Typography>
           {loadingPets ? <CircularProgress /> : (
             <List dense>
               {pets.length === 0 && !error && <ListItem><ListItemText primary="No pets found or loaded." /></ListItem>}
               {pets.map(pet => (
                 <ListItem
                   key={pet.id}
                   secondaryAction={
                     <IconButton
                       edge="end"
                       aria-label={`Delete pet ${getPetDisplayName(pet)}`}
                       onClick={() => handleDeletePet(pet.id)}
                       disabled={actionLoading === `pet-${pet.id}`}
                     >
                       {actionLoading === `pet-${pet.id}` ? <CircularProgress size={20} /> : <DeleteIcon />}
                     </IconButton>
                   }
                   divider
                 >
                   <ListItemText
                     primary={getPetDisplayName(pet)}
                      secondary={`ID: ${pet.id} | Type: ${pet.species || '?'} | Breed: ${pet.breed || '?'} | ShelterID: ${pet.adoptionCenterId || '?'}`}
                   />
                 </ListItem>
               ))}
             </List>
           )}
         </TabPanel>

        <TabPanel value={tabValue} index={1} id="admin-tabpanel-1" aria-labelledby="admin-tab-1">
           <Typography variant="h6" gutterBottom>User Accounts (excluding current admin)</Typography>
          {loadingUsers ? <CircularProgress /> : (
             <List dense>
               {users.length === 0 && !error && <ListItem><ListItemText primary="No other users found or loaded." /></ListItem>}
               {users.map(usr => (
                 <ListItem
                    key={usr.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={`Delete user ${getUserDisplayName(usr)}`}
                        onClick={() => handleDeleteUser(usr.id, usr.emailAddress || 'unknown email')}
                        disabled={actionLoading === `user-${usr.id}`}
                      >
                         {actionLoading === `user-${usr.id}` ? <CircularProgress size={20} /> : <DeleteIcon />}
                      </IconButton>
                    }
                    divider
                 >
                   <ListItemText
                     primary={getUserDisplayName(usr)}
                     secondary={`ID: ${usr.id} | Email: ${usr.emailAddress || '?'} | Type: ${usr.userType || '?'}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}


function UserProfile({ user, BACKEND }) {
  const router = useRouter();
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

  const isShelter = user?.userType === "SHELTER";

  useEffect(() => {
      if (user) {
        setEmail(user.emailAddress || "");
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setPhone(user.phone || "");
        setAddress(user.address || "");
        if (isShelter) {
          setShelterName(user.shelterName || "");
        }
      }
  }, [user, isShelter]); 

  const fetchMyPets = useCallback(async () => {
    if (!user?.id) return;
    setLoadingMyPets(true);
    setMyPetsError("");
    setMyPets([]);

    const endpoint = isShelter
        ? `${BACKEND}/api/pets/shelter/${user.id}`
        : `${BACKEND}/api/pets/adopter/${user.id}`;

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(endpoint, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      if (!res.ok) throw new Error(`Failed to fetch pets (${res.status}): ${await res.text()}`);
      const data = await res.json();
      setMyPets(data || []);
    } catch (err) {
      console.error("My Pets fetch error:", err);
      setMyPetsError(err.message);
      setMyPets([]);
    } finally {
      setLoadingMyPets(false);
    }
  }, [BACKEND, user, isShelter]); 

  useEffect(() => {
    if (tabValue === 1) {
      fetchMyPets();
    }
  }, [tabValue, fetchMyPets]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
    router.push("/login");
  };

  const handleTabChange = (_, newVal) => setTabValue(newVal);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    setUpdateMessage("");
    setUpdateError("");

    if (!email) { setUpdateError("Email cannot be empty."); return; }
    if (isShelter && !shelterName) { setUpdateError("Shelter name cannot be empty."); return; }
    if (!isShelter && (!firstName || !lastName)) { setUpdateError("First and Last name cannot be empty."); return; }

    const payload = {
      id: user.id,
      emailAddress: email,
      firstName,
      lastName,
      phone,
      address,
      shelterName: isShelter ? shelterName : null, 
      userType: user.userType, 

    };

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${BACKEND}/api/user`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json(); 
      if (!res.ok) throw new Error(data.error || data.message || `Update failed status ${res.status}`);

      sessionStorage.setItem("user", JSON.stringify(data));
      setUpdateMessage("Profile updated successfully!");
       setTimeout(() => setUpdateMessage(""), 5000);
    } catch (err) {
      console.error("Profile update error:", err);
      setUpdateError(`Update failed: ${err.message}`);
      setTimeout(() => setUpdateError(""), 5000);
    }
  };

   const getUserDisplayName = (u) => {
       const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
       return name || u.shelterName || u.emailAddress || 'User Profile'; 
   }

  return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3}>
               <Box sx={{ p: 3,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" },
                textAlign: { xs: "center", sm: "left" }, }}>
                 <Avatar sx={{width: 80,
                  height: 80,
                  mb: { xs: 2, sm: 0 },
                  mr: { xs: 0, sm: 3 },bgcolor: "secondary.main", color: "white"}}>
                     {(user.firstName?.charAt(0) || user.shelterName?.charAt(0) || user.emailAddress?.charAt(0) || 'U').toUpperCase()}
                 </Avatar>
                 <Box>
                     <Typography variant="h4">{getUserDisplayName(user)}</Typography>
                     <Typography variant="subtitle1">{user.emailAddress}</Typography>
                     <Typography variant="caption" display="block">
                         Type: {user.userType || 'Unknown'} | ID: {user.id || 'N/A'}
                     </Typography>
                 </Box>
                  <Button variant="outlined" color="inherit" onClick={handleLogout} sx={{ ml: 'auto', mt: { xs: 2, sm: 0 } }}>
                      Logout
                  </Button>
              </Box>

              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="profile tabs">
                      <Tab label="Profile Info" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
                      <Tab label="My Pets" id="profile-tab-1" aria-controls="profile-tabpanel-1"/>
                      <Tab label="Edit Profile" id="profile-tab-2" aria-controls="profile-tabpanel-2"/>
                      <Tab label="Notifications" id="profile-tab-3" aria-controls="profile-tabpanel-3"/>
                  </Tabs>
              </Box>

              {/* TabPanels */}
              <TabPanel value={tabValue} index={0} id="profile-tabpanel-0" aria-labelledby="profile-tab-0">
                   <Typography variant="h6" gutterBottom>Account Information</Typography>
                   <Divider sx={{ mb: 2 }} />
                   <List dense>
                       {/* Use emailAddress */}
                       <ListItem><ListItemText primary="Email" secondary={user.emailAddress || "—"} /></ListItem>
                       <ListItem><ListItemText primary="User Type" secondary={user.userType || 'Unknown'} /></ListItem>
                       {isShelter ? (
                           <ListItem><ListItemText primary="Shelter Name" secondary={user.shelterName || "—"} /></ListItem>
                       ) : (
                           <>
                               <ListItem><ListItemText primary="First Name" secondary={user.firstName || "—"} /></ListItem>
                               <ListItem><ListItemText primary="Last Name" secondary={user.lastName || "—"} /></ListItem>
                           </>
                       )}
                       <ListItem><ListItemText primary="Phone" secondary={user.phone || "—"} /></ListItem>
                       <ListItem><ListItemText primary="Address" secondary={user.address || "—"} /></ListItem>
                   </List>
                   <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                       <Button variant="outlined" onClick={() => router.push("/")}>Go Home</Button>
                   </Stack>
               </TabPanel>

              <TabPanel value={tabValue} index={1} id="profile-tabpanel-1" aria-labelledby="profile-tab-1">
                   <Typography variant="h6" gutterBottom>
                       {isShelter ? "Your Listed Pets" : "Your Adopted Pets / Interests"}
                   </Typography>
                   <Divider sx={{ mb: 2 }} />
                   {loadingMyPets ? ( <Box sx={{ textAlign: "center", p: 4 }}><CircularProgress /></Box>
                   ) : myPetsError ? ( <Alert severity="error">{myPetsError}</Alert>
                   ) : myPets.length > 0 ? (
                       <Grid container spacing={3}>
                           {myPets.map((pet) => (
                               <Grid item xs={12} sm={6} md={4} key={pet.id}>
                                   <PetCard pet={pet}>
                                   </PetCard>
                               </Grid>
                           ))}
                       </Grid>
                   ) : (
                       <Box textAlign="center" sx={{ p: 4 }}>
                           <Typography gutterBottom>
                               {isShelter ? "You haven't listed any pets yet." : "No adopted pets found."}
                           </Typography>
                             <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push(isShelter ? "/addPet" : "/adopt")}>
                               {isShelter ? "Add a Pet" : "Browse Pets"}
                           </Button>
                       </Box>
                   )}
               </TabPanel>

              <TabPanel value={tabValue} index={2} id="profile-tabpanel-2" aria-labelledby="profile-tab-2">
                   <Typography variant="h6" gutterBottom>Edit Profile</Typography>
                   <Divider sx={{ mb: 2 }} />
                   {updateMessage && <Alert severity="success" sx={{ mb: 2 }}>{updateMessage}</Alert>}
                   {updateError && <Alert severity="error" sx={{ mb: 2 }}>{updateError}</Alert>}
                   <TextField fullWidth required label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} type="email"/>
                   {isShelter ? (
                       <TextField fullWidth required label="Shelter Name" value={shelterName} onChange={(e) => setShelterName(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }}/>
                   ) : (
                       <>
                           <TextField fullWidth required label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }}/>
                           <TextField fullWidth required label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }}/>
                       </>
                   )}
                   <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} type="tel"/>
                   <TextField fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} helperText="e.g., 123 Main St, Anytown, CA" />
                   <Button variant="contained" sx={{ mt: 2 }} onClick={handleUpdateProfile}>
                       Save Changes
                   </Button>
               </TabPanel>

              <TabPanel value={tabValue} index={3} id="profile-tabpanel-3" aria-labelledby="profile-tab-3">
                  <NotificationsTab user={user} />
              </TabPanel>
          </Paper>
      </Container>
  );
}


export default function ProfilePage() {
  const router = useRouter();
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const token = localStorage.getItem("jwtToken");

    if (!storedUser || !token) {
       console.log("User or token not found, redirecting.");
       router.push("/login?redirect=/profile");
       return;
    }

    let parsedUserId;
    try {
        const parsed = JSON.parse(storedUser);
        parsedUserId = parsed.id || parsed.userId; 
        if (!parsedUserId) throw new Error("User ID missing.");
    } catch (e) {
        console.error("Session parse error:", e);
        sessionStorage.removeItem("user");
        localStorage.removeItem("jwtToken");
        setFetchError("Invalid session. Log in again.");
        setLoading(false);
        router.push("/login?redirect=/profile");
        return;
    }

    fetch(`${BACKEND}/users/${parsedUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
            throw new Error("Unauthorized access. Please log in again.");
        }
        if (!res.ok) {
            throw new Error(`Failed to fetch profile (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        sessionStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        setFetchError('');
      })
      .catch((err) => {
        console.error("Fetch profile error:", err);
        setFetchError(`Failed to load profile: ${err.message}. Redirecting...`);
        sessionStorage.removeItem("user");
        localStorage.removeItem("jwtToken");
        setUser(null);
        setTimeout(() => router.push("/login?redirect=/profile"), 3000);
      })
      .finally(() => setLoading(false));

  }, [BACKEND, router]);

  if (loading) { 
     return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress /> <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
   }
  if (fetchError) { 
     return ( <Container sx={{ textAlign: "center", mt: 8 }}> <Alert severity="error">{fetchError}</Alert> </Container> );
   }
  if (!user) { 
      return ( <Container sx={{ textAlign: "center", mt: 8 }}> <Typography>Redirecting...</Typography> <CircularProgress /> </Container> );
  }

  const isAdmin = user?.userType === 'ADMIN';

  return (
    <>
      <Head>
        <title>{isAdmin ? 'Admin Dashboard' : 'My Profile'} – Pet Adoption</title>
      </Head>
      <main>
        {isAdmin ? (
          <AdminDashboard user={user} BACKEND={BACKEND} />
        ) : (
          <UserProfile user={user} BACKEND={BACKEND} />
        )}
      </main>
    </>
  );
}