import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PetCard from "../Components/PetCard";

// List of all 50 U.S. states
const states = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
  "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
  "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

export default function Adopt() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    userEmail: "",
    petId: "",
    adoptionCenterId: "",
    additionalNotes: "",
    displayName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // pagination and filters
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080";

  // load user (if logged in)
  useEffect(() => {
    const s = sessionStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);

  const isShelter = user?.userType === "SHELTER";
  const isAdmin = user?.userType === "ADMIN";

  const fetchPets = useCallback(
    async (p = 0, size = pageSize, state = filterState, city = filterCity) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("jwtToken");
        let url = `${BACKEND}/api/pets?page=${p}&size=${size}`;
        if (state) url += `&state=${encodeURIComponent(state)}`;
        if (city) url += `&city=${encodeURIComponent(city)}`;

        // Fetch pets without requiring authentication
        const res = await fetch(
          url,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPets(data.content);
        setTotalPages(data.totalPages);
        setPage(p);
      } catch (e) {
        setError(`Error fetching pets: ${e.message}`);
      } finally {
        setLoading(false);
      }
    },
    [BACKEND, filterState, filterCity, pageSize]
  );

  // initial and on filter changes
  useEffect(() => {
    fetchPets(0);
  }, [fetchPets]);

  // handlers
  const handleImportCSV = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${BACKEND}/api/pets/import-csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());
      const imported = await res.json();
      alert(`Imported ${imported.length} pets`);
      fetchPets(page, pageSize);
    } catch (e) {
      alert(`Import CSV error: ${e.message}`);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL pets?")) return;
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${BACKEND}/api/pets/all`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());
      alert("All pets deleted!");
      fetchPets(0);
    } catch (e) {
      alert(`Delete error: ${e.message}`);
    }
  };

  const handleInterest = useCallback((pet) => {
    if (!user) {
      // Redirect to login if user is not logged in
      router.push("/login?redirect=/adopt");
      return;
    }
    
    setSelectedPet(pet);
    const name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;
    setFormData({
      userId: user.id,
      userEmail: user.email,
      petId: pet.id,
      adoptionCenterId: pet.adoptionCenterId,
      additionalNotes: "",
      displayName: name,
    });
    setOpenDialog(true);
  }, [user, router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${BACKEND}/api/adoption-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      alert("Your interest has been submitted!");
      setOpenDialog(false);
    } catch (e) {
      setError(`Submission failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if the pet belongs to the logged-in shelter
  const isPetOwnedByShelter = (pet) => {
    return isShelter && user?.id === pet.adoptionCenterId;
  };

  return (
    <>
      <Head>
        <title>Adopt a Pet</title>
      </Head>
      <main>
      <Stack spacing={4} sx={{ pt:4 }} alignItems="center">
  <Card sx={{ width: '90%', maxWidth: 1200 }}>
    <CardContent>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h3">Adopt a Pet</Typography>
        
        {/* Shelter Management section - only visible to shelter users */}
        {isShelter && (
          <Box sx={{ width: '100%', mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Shelter Management</Typography>
            <Stack direction="row" spacing={2}>
              <Link href="/addPet" passHref>
                <Button variant="contained">Add Pet</Button>
              </Link>
            </Stack>
          </Box>
        )}
        
        {/* Admin Controls section - only visible to admin users */}
        {isAdmin && (
          <Box sx={{ width: '100%', mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Admin Controls</Typography>
            <Stack direction="row" spacing={2}>
              <Link href="/addPet" passHref>
                <Button variant="contained">Add Pet</Button>
              </Link>
              <Button variant="contained" onClick={handleImportCSV}>Import CSV</Button>
              <Button color="error" onClick={handleDeleteAll}>Delete All</Button>
            </Stack>
          </Box>
        )}
        
        {/* Filter section - available to all users */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter Pets</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>State</InputLabel>
                <Select 
                  value={filterState} 
                  label="State" 
                  onChange={e => { setFilterState(e.target.value); }}
                >
                  <MenuItem value="">All States</MenuItem>
                  {states.map(st => <MenuItem key={st} value={st}>{st}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                label="City" 
                size="small" 
                fullWidth
                value={filterCity} 
                onChange={e => setFilterCity(e.target.value)} 
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: {xs: 'flex-start', md: 'flex-end'} }}>
                <Button variant="outlined" onClick={() => fetchPets(0)}>
                  Apply Filters
                </Button>
                <Button 
                  variant="text" 
                  onClick={() => { 
                    setFilterState(''); 
                    setFilterCity(''); 
                    fetchPets(0); 
                  }}
                >
                  Clear
                </Button>
                {/* Near Me button is disabled if user isn't logged in or has no address */}
                <Button
                  variant="outlined"
                  disabled={!user?.address}
                  onClick={() => {
                    const addr = user.address || "";
                    const parts = addr.split(",").map(s => s.trim());
                    if (parts.length === 2) {
                      const [city, locState] = parts;
                      setFilterCity(city);
                      setFilterState(locState);
                      fetchPets(0, pageSize, locState, city);
                    }
                  }}
                >
                  Near Me
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        
        {/* Display settings - available to all users */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <FormControl size="small" sx={{ width: 140 }}>
            <InputLabel>Pets per page</InputLabel>
            <Select 
              value={pageSize} 
              label="Pets per page" 
              onChange={e => { 
                setPageSize(Number(e.target.value)); 
                fetchPets(0); 
              }}
            >
              {[3, 6, 9, 12].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        
        {/* Login notification for anonymous users */}
        {!user && (
          <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
            You can browse pets without logging in, but you will need to 
            <Link href="/login?redirect=/adopt" passHref>
              <Button color="primary" size="small" sx={{ mx: 1 }}>Login</Button>
            </Link> 
            to express interest in a pet.
          </Alert>
        )}
      </Stack>
    </CardContent>
  </Card>

          {loading ? <CircularProgress /> : (
            <>
              <Grid container spacing={3} justifyContent="center">
                {pets.map(pet => (
                  <Grid item xs={12} sm={6} md={4} key={pet.id}>
                    <PetCard pet={pet}>
                      {/* Only show interest button if user is not a shelter or if the pet doesn't belong to this shelter */}
                      {!isPetOwnedByShelter(pet) && (
                        <Button 
                          fullWidth 
                          variant="contained" 
                          onClick={() => handleInterest(pet)}
                        >
                          {user ? "Interested!" : "Login to Express Interest"}
                        </Button>
                      )}
                      {/* Show a disabled button with message if shelter owns this pet */}
                      {isPetOwnedByShelter(pet) && (
                        <Button
                          fullWidth
                          variant="outlined"
                          disabled
                        >
                          Your Shelter Pet
                        </Button>
                      )}
                    </PetCard>
                  </Grid>
                ))}
              </Grid>
              
              {/* No pets message */}
              {pets.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  No pets found matching your criteria. Try adjusting your filters.
                </Alert>
              )}
              
              <Box sx={{mt:3}}>
                <Pagination count={totalPages} page={page+1} onChange={(_,v)=>fetchPets(v-1)} />
              </Box>
            </>
          )}
        </Stack>

        <Dialog open={openDialog} onClose={()=>setOpenDialog(false)}>
          <DialogTitle>Confirm Your Interest</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{mt:1}}>
              <TextField label="Your Name" value={formData.displayName} disabled fullWidth />
              <TextField label="Your Email" value={formData.userEmail} disabled fullWidth />
              <TextField label="Pet Name" value={selectedPet?.name||""} disabled fullWidth />
              <TextField
                label="Additional Notes"
                multiline rows={3}
                value={formData.additionalNotes}
                onChange={e=>setFormData(f=>({...f, additionalNotes:e.target.value}))}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </>
  );
}