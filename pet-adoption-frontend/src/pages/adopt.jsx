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

  // load user from sessionStorage
  useEffect(() => {
    const s = sessionStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);

  const isShelter = user?.userType === "SHELTER";
  const isAdopter = user && user.userType !== "SHELTER";

  // fetch paged pets with auth if available
  const fetchPets = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(
          `${BACKEND}/api/pets?page=${p}&size=${size}`,
          token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {}
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        const data = await res.json();
        setPets(data.content);
        setTotalPages(data.totalPages);
      } catch (e) {
        setError(`Error fetching pets: ${e.message}`);
      } finally {
        setLoading(false);
      }
    },
    [BACKEND, page, pageSize]
  );

  // initial load & when pageSize changes
  useEffect(() => {
    fetchPets(0, pageSize);
    setPage(0);
  }, [fetchPets, pageSize]);

  // shelter-only: import CSV
  const handleImportCSV = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${BACKEND}/api/pets/import-csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const imported = await res.json();
      alert(`Imported ${imported.length} pets`);
      fetchPets(page, pageSize);
    } catch (e) {
      alert("Import CSV error: " + e.message);
    }
  };

  // shelter-only: delete all pets
  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL pets?")) return;
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${BACKEND}/api/pets/all`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      alert("All pets deleted!");
      fetchPets(0, pageSize);
      setPage(0);
    } catch (e) {
      alert("Delete error: " + e.message);
    }
  };

  // open “Interested!” dialog
  const handleInterest = useCallback(
    (pet) => {
      if (!user) return router.push("/login");
      setError(null);
      setSelectedPet(pet);

      if (!pet.id) {
        setError("Invalid pet data: missing ID.");
        return;
      }
      if (!pet.adoptionCenterId) {
        setError("This pet has no shelter assigned.");
        return;
      }

      const name =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.emailAddress || user.email || "Anonymous";

      const userId = user.id || user.userId;
      if (!userId) {
        setError("Your account is missing an ID. Please re-login.");
        return;
      }

      setFormData({
        userId,
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

  // submit adoption request
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const { userId, petId, adoptionCenterId } = formData;
    if (!userId || !petId || !adoptionCenterId) {
      setError("Missing required fields. Cannot submit.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        userId,
        petId,
        adoptionCenterId,
        notes: formData.additionalNotes || "",
        displayName: formData.displayName || "",
      };

      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${BACKEND}/api/adoption-requests`, {
      method: "POST",
      headers: {
     "Content-Type": "application/json",
     ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try {
          const obj = JSON.parse(text);
          msg = obj.error || obj.message || text;
        } catch {// ignore JSON-parse errors
          }
        throw new Error(msg);
      }

      setOpenDialog(false);
      alert("Your interest has been submitted!");
    } catch (e) {
      setError("Submission failed: " + e.message);
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
                        const sz = Number(e.target.value);
                        setPageSize(sz);
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
                    const next = v - 1;
                    setPage(next);
                    fetchPets(next, pageSize);
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
