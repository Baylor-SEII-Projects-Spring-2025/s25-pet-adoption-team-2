// pages/adopt.jsx
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

  // pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(6);

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  // load user
  useEffect(() => {
    const s = sessionStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);

  const isShelter = user?.userType === "SHELTER";
  const isAdopter = user && user.userType !== "SHELTER";

  // fetch paged pets
  const fetchPets = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BACKEND}/api/pets?page=${p}&size=${size}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPets(data.content);
        setTotalPages(data.totalPages);
      } catch (e) {
        setError(`Fetch pets error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    },
    [BACKEND, page, pageSize]
  );

  // initial & on pageSize change
  useEffect(() => {
    fetchPets(0, pageSize);
    setPage(0);
  }, [fetchPets, pageSize]);

  // import/delete (shelter only)
  const handleImportCSV = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/pets/import-csv`);
      if (!res.ok) throw new Error(await res.text());
      const imported = await res.json();
      alert(`Imported ${imported.length} pets`);
      fetchPets(page, pageSize);
    } catch (e) {
      alert("Import CSV error: " + e.message);
    }
  };
  const handleDeleteAll = async () => {
    if (!confirm("Really delete ALL pets?")) return;
    try {
      const res = await fetch(`${BACKEND}/api/pets/all`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      alert("All pets deleted!");
      fetchPets(0, pageSize);
      setPage(0);
    } catch (e) {
      alert("Delete all error: " + e.message);
    }
  };

  // open "Interested!" dialog
  const handleInterest = useCallback(
    (pet) => {
      if (!user) return router.push("/login");
      setError(null);
      setSelectedPet(pet);
      
      console.log("Pet data:", pet);
      console.log("User data:", user);

      // Check if pet has all required fields
      if (!pet.id) {
        setError("Invalid pet data: Missing pet ID");
        return;
      }
      
      if (!pet.adoptionCenterId) {
        setError("This pet doesn't have an associated shelter. Please contact support.");
        return;
      }

      // Build a displayName
      const name =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.emailAddress || user.email || "Anonymous User";

      // Ensure userId is available and valid
      const userId = user.id || user.userId;
      if (!userId) {
        setError("User information is incomplete. Please log out and log back in.");
        return;
      }

      setFormData({
        userId: userId,
        userEmail: user.emailAddress || user.email || "",
        petId: pet.id,
        adoptionCenterId: pet.adoptionCenterId,
        additionalNotes: "",
        displayName: name,
      });

      setOpenDialog(true);
    },
    [user, router]
  );

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
  
    // Validate required fields before submission
    if (!formData.userId || !formData.petId || !formData.adoptionCenterId) {
      setError("Missing required fields. Please try again or contact support.");
      setIsSubmitting(false);
      return;
    }
  
    // Create a complete adoption request with all possible fields
    const adoptionRequestData = {
      userId: formData.userId,
      petId: formData.petId,
      adoptionCenterId: formData.adoptionCenterId,
      notes: formData.additionalNotes || "",
      displayName: formData.displayName || ""
    };
  
    console.log("Sending adoption request:", adoptionRequestData);
  
    try {
      // Send only the adoption request
      // The backend will handle creating the notification
      const res = await fetch(`${BACKEND}/api/adoption-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adoptionRequestData),
      });
      
      if (!res.ok) {
        // Try to parse the error as JSON first
        const errorText = await res.text();
        let errorMessage = errorText;
        try {
          const errorObj = JSON.parse(errorText);
          errorMessage = errorObj.error || errorObj.message || errorText;
        } catch (parseError) {
          // If not JSON, use the text directly
          // Using parseError instead of e to avoid the unused variable warning
          console.log("Could not parse error as JSON:", parseError.message);
        }
        
        console.error("Adoption request error:", errorMessage);
        throw new Error(`Failed to submit adoption request: ${errorMessage}`);
      }
  
      // Success - close dialog and show confirmation
      setOpenDialog(false);
      alert("Your interest has been sent!");
    } catch (error) {
      // Using 'error' instead of 'e' and making sure we use it
      console.error("Error in handleSubmit:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Adopt a Pet</title>
      </Head>
      <main>
        <Stack spacing={4} sx={{ pt: 4 }} alignItems="center">
          <Card sx={{ width: "90%", maxWidth: 1200 }}>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h3">Adopt a Pet</Typography>
                <Stack direction="row" spacing={2}>
                  {isShelter && (
                    <>
                      <Link href="/addPet" passHref>
                        <Button variant="contained">Add Pet</Button>
                      </Link>
                      <Button variant="contained" onClick={handleImportCSV}>
                        Import CSV
                      </Button>
                      <Button color="error" onClick={handleDeleteAll}>
                        Delete All
                      </Button>
                    </>
                  )}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Page Size</InputLabel>
                    <Select
                      value={pageSize}
                      label="Page Size"
                      onChange={(e) => {
                        setPageSize(+e.target.value);
                        setPage(0);
                      }}
                    >
                      {[3, 6, 9, 12].map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            </CardContent>
          </Card>

          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Grid container spacing={3} justifyContent="center">
                {pets.map((pet) => (
                  <Grid item xs={12} sm={6} md={4} key={pet.id}>
                    <PetCard pet={pet}>
                      {isAdopter && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleInterest(pet)}
                        >
                          Interested!
                        </Button>
                      )}
                    </PetCard>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, v) => {
                    const np = v - 1;
                    setPage(np);
                    fetchPets(np, pageSize);
                  }}
                />
              </Box>
            </>
          )}
        </Stack>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm Your Interest</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Your Name"
                value={formData.displayName}
                disabled
                fullWidth
              />
              <TextField
                label="Your Email"
                value={formData.userEmail}
                disabled
                fullWidth
              />
              <TextField
                label="Selected Pet"
                value={selectedPet?.name || ""}
                disabled
                fullWidth
              />
              <TextField
                label="Additional Notes"
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, additionalNotes: e.target.value }))
                }
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </>
  );
}