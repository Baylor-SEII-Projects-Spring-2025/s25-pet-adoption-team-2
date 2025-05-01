// pages/addPet.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function AddPet() {
  const router = useRouter();
  const [pet, setPet] = useState({
    name: "",
    age: "",
    species: "",
    breed: "",
    gender: "",
    healthStatus: "",
    coatLength: "",
    weight: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);

  // Dropdown options
  const speciesOptions = ["Dog", "Cat"];
  const genderOptions = ["Male", "Female", "Other"];
  const healthStatusOptions = ["Excellent", "Good", "Fair", "Poor"];
  const coatLengthOptions = ["Hairless", "Short", "Medium", "Long"];

  // Guard: only allow logged-in shelter users
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const u = JSON.parse(stored);
    if (u.userType !== "SHELTER") {
      router.replace("/");
      return;
    }
    setUser(u);
  }, [router]);

  const handleChange = (e) => {
    setPet((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const resetForm = () => {
    setPet({
      name: "",
      age: "",
      species: "",
      breed: "",
      gender: "",
      healthStatus: "",
      coatLength: "",
      weight: "",
      description: "",
    });
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user?.id) {
      setError("Shelter ID not found. Please log in again.");
      return;
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const formData = new FormData();

    // Append pet fields
    Object.entries(pet).forEach(([key, val]) => {
      formData.append(key, val);
    });
    // Use shelter’s own ID
    formData.append("adoptionCenterId", user.id);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${backendUrl}/api/pets/add`, {
        method: "POST",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      await res.json();
      setOpenSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to add pet: " + err.message);
    }
  };

  const handleAddMore = () => {
    setOpenSuccess(false);
    resetForm();
  };

  const handleSeeFuture = () => {
    router.push("/adopt");
  };

  if (!user) {
    // while the redirect is in flight
    return null;
  }

  return (
    <>
      <Head>
        <title>Add Pet</title>
      </Head>

      <Stack sx={{ p: 4 }} alignItems="center">
        <Card sx={{ width: 600 }} elevation={4}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Add a New Pet
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  name="name"
                  value={pet.name}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Age"
                  name="age"
                  type="number"
                  value={pet.age}
                  onChange={handleChange}
                  required
                />

                <FormControl fullWidth required>
                  <InputLabel>Species</InputLabel>
                  <Select
                    label="Species"
                    name="species"
                    value={pet.species}
                    onChange={handleChange}
                  >
                    {speciesOptions.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Breed"
                  name="breed"
                  value={pet.breed}
                  onChange={handleChange}
                  required
                />

                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    name="gender"
                    value={pet.gender}
                    onChange={handleChange}
                  >
                    {genderOptions.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Health Status</InputLabel>
                  <Select
                    label="Health Status"
                    name="healthStatus"
                    value={pet.healthStatus}
                    onChange={handleChange}
                  >
                    {healthStatusOptions.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Coat Length</InputLabel>
                  <Select
                    label="Coat Length"
                    name="coatLength"
                    value={pet.coatLength}
                    onChange={handleChange}
                  >
                    {coatLengthOptions.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Weight (lbs)"
                  name="weight"
                  type="number"
                  value={pet.weight}
                  onChange={handleChange}
                  required
                />

                <TextField
                  label="Description"
                  name="description"
                  value={pet.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />

                <input type="file" onChange={handleFileChange} />

                <Button variant="contained" type="submit">
                  Add Pet
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={openSuccess} onClose={handleAddMore}>
        <DialogTitle>Pet Added!</DialogTitle>
        <DialogContent>
          <Typography>Your pet has been successfully added.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddMore}>Add Another</Button>
          <Button variant="contained" onClick={handleSeeFuture}>
            See Pets
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
