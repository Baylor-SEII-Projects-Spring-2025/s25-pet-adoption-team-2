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
    userName: "",
    userEmail: "",
    petId: "",
    adoptionCenterId: "",
    additionalNotes: "",
    displayName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(6);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  // load logged-in user
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const isShelter = user?.userType === "SHELTER";
  const isAdopter = user && user.userType !== "SHELTER";

  const fetchPets = useCallback(
    async (pageToFetch = page, size = pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${backendUrl}/api/pets?page=${pageToFetch}&size=${size}`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const pageData = await res.json();
        setPets(pageData.content);
        setTotalPages(pageData.totalPages);
      } catch (err) {
        setError("Error fetching pets: " + err.message);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl, page, pageSize]
  );

  // initial load & pageSize change
  useEffect(() => {
    fetchPets(0, pageSize);
    setPage(0);
  }, [fetchPets, pageSize]);

  const handleImportCSV = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/pets/import-csv`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      alert(`Imported ${data.length} pets successfully!`);
      fetchPets(page, pageSize);
    } catch (err) {
      console.error(err);
      alert("Failed to import CSV: " + err.message);
    }
  };

  const handleDeleteAllPets = async () => {
    if (!window.confirm("Are you sure you want to delete ALL pets?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/pets/all`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      alert("All pets deleted!");
      fetchPets(0, pageSize);
      setPage(0);
    } catch (err) {
      alert("Failed to delete pets: " + err.message);
    }
  };

  const handleInterestClick = useCallback(
    (pet) => {
      if (!user) {
        router.push("/login");
        return;
      }
      if (!pet.adoptionCenterId) {
        setError("No adoption agencies available for this pet.");
        return;
      }
      setSelectedPet(pet);
      setFormData({
        userId: user.id || "",
        userName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "",
        userEmail: user.emailAddress || "",
        petId: pet.id,
        adoptionCenterId: pet.adoptionCenterId,
        additionalNotes: "",
        displayName: "",
      });
      setOpenDialog(true);
    },
    [user, router]
  );

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let res = await fetch(`${backendUrl}/api/adoption-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Adoption request failed");

      res = await fetch(`${backendUrl}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: formData.petId.toString(),
          userId: formData.userId,
          displayName: formData.displayName,
        }),
      });
      if (!res.ok) throw new Error("Notification failed");

      setOpenDialog(false);
      setError(null);
      alert("Adoption request submitted successfully!");
    } catch (err) {
      setError("Error submitting request: " + err.message);
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
        <Stack sx={{ pt: 4 }} alignItems="center" spacing={3}>
          <Card sx={{ width: "90%", maxWidth: 1200 }} elevation={4}>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h3">Adopt a Pet</Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  {/** only shelter users get these */}
                  {isShelter && (
                    <>
                      <Link href="/addPet" passHref>
                        <Button variant="contained">Add a Pet</Button>
                      </Link>
                      <Button variant="contained" onClick={handleImportCSV}>
                        Import Pets CSV
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteAllPets}
                      >
                        Delete All Pets
                      </Button>
                    </>
                  )}

                  {/** page size control for everyone */}
                  <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel id="page-size-label">Page Size</InputLabel>
                    <Select
                      labelId="page-size-label"
                      value={pageSize}
                      label="Page Size"
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value, 10);
                        setPageSize(newSize);
                        setPage(0);
                      }}
                    >
                      {[3, 6, 9, 12].map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
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
                      {/** only adopters can express interest */}
                      {isAdopter && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleInterestClick(pet)}
                        >
                          Interested!
                        </Button>
                      )}
                    </PetCard>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4, mb: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, value) => {
                    const newPage = value - 1;
                    setPage(newPage);
                    fetchPets(newPage, pageSize);
                  }}
                />
              </Box>
            </>
          )}
        </Stack>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Adoption Interest Form</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="User ID"
                value={formData.userId}
                disabled
                fullWidth
              />
              <TextField
                label="Name"
                value={formData.userName}
                disabled
                fullWidth
              />
              <TextField
                label="Email"
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
                label="Adoption Center ID"
                value={formData.adoptionCenterId}
                disabled
                fullWidth
              />
              <TextField
                label="Additional Notes"
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    additionalNotes: e.target.value,
                  }))
                }
                multiline
                rows={4}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
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
