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

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  // load logged‑in user (if any)
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${backendUrl}/api/pets/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setPets(data);
    } catch (err) {
      setError("Error fetching pets: " + err.message);
      if (err.message.includes("401")) {
        console.log("Unauthorized to fetch pets.");
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleImportCSV = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${backendUrl}/api/pets/import-csv`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      alert(`Imported ${data.length} pets successfully!`);
      fetchPets();
    } catch (err) {
      console.error(err);
      alert("Failed to import CSV: " + err.message);
      if (err.message.includes("401")) {
        console.log("Unauthorized to import CSV.");
      }
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
    [user, router],
  );

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('jwtToken');

    try {
      // create adoption request
      let res = await fetch(`${backendUrl}/api/adoption-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Adoption request failed");

      // create notification
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
      if (err.message.includes("401")) {
        console.log("Unauthorized to submit adoption request or notification.");
      }
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
                  <Link href="/addPet" passHref>
                    <Button variant="contained">Add a Pet</Button>
                  </Link>
                  <Button variant="contained" onClick={handleImportCSV}>
                    Import Pets CSV
                  </Button>
                </Stack>
                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            </CardContent>
          </Card>

          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {pets.map((pet) => (
                <Grid item xs={12} sm={6} md={4} key={pet.id}>
                  <PetCard pet={pet}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleInterestClick(pet)}
                    >
                      Interested!
                    </Button>
                  </PetCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Adoption Interest Form</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Your Name"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                fullWidth
                required
              />
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
