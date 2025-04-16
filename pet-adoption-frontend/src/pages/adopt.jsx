import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import { useRouter } from "next/router";

export default function Adopt() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    // Check if user is logged in
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8080/api/pets/all');
      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }
      const data = await response.json();
      setPets(data);
    } catch (err) {
      setError('Error fetching pets: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleInterestClick = useCallback((pet) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!pet.adoptionCenterId) {
      setError("No adoption agencies can assist with this pet at the moment.");
      return;
    }

    setSelectedPet(pet);
    setFormData({
      userId: user?.id || "",
      userName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      userEmail: user?.emailAddress || "",
      petId: pet.id,
      adoptionCenterId: pet.adoptionCenterId,
      additionalNotes: "",
      displayName: "",
    });
    setOpenDialog(true);
  }, [user, router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // First submit the adoption request
      const adoptionResponse = await fetch('http://localhost:8080/api/adoption-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!adoptionResponse.ok) {
        throw new Error('Failed to submit adoption request');
      }

      const notificationResponse = await fetch('http://localhost:8080/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.petId.toString(),
          userId: formData.userId,
          displayName: formData.displayName
        }),
      });

      if (!notificationResponse.ok) {
        throw new Error('Failed to create notification');
      }

      setOpenDialog(false);
      setError(null);
      alert('Adoption request submitted successfully!');
    } catch (err) {
      setError('Error submitting adoption request: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Adopt</title>
      </Head>

      <main>
        <Stack sx={{ paddingTop: 4 }} alignItems="center" gap={2}>
          <Card sx={{ width: '90%', maxWidth: 1200 }} elevation={4}>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h3" align="center">
                  Adopt a Pet
                </Typography>

                {error && (
                  <Alert severity="error">{error}</Alert>
                )}

                {loading ? (
                  <Stack alignItems="center">
                    <CircularProgress />
                  </Stack>
                ) : (
                  <Grid container spacing={3}>
                    {pets.map((pet) => (
                      <Grid item xs={12} sm={6} md={4} key={pet.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">{pet.name}</Typography>
                            <Typography>Species: {pet.species}</Typography>
                            <Typography>Breed: {pet.breed}</Typography>
                            <Typography>Age: {pet.age}</Typography>
                            <Typography>Gender: {pet.gender}</Typography>
                            <Typography>Status: {pet.status}</Typography>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => handleInterestClick(pet)}
                              >
                                Interested in!
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Adoption Interest Form</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Name: "
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                fullWidth
                required
                placeholder="Enter your name: "
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
                value={selectedPet?.name}
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
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
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
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </>
  );
}
