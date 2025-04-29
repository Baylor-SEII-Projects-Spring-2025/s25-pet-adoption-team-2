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

  // dropdown options
  const speciesOptions = ["Dog", "Cat"];
  const genderOptions = ["Male", "Female", "Other"];
  const healthStatusOptions = ["Excellent", "Good", "Fair", "Poor"];
  const coatLengthOptions = ["Hairless", "Short", "Medium", "Long"];

  // 1️⃣ on mount, load user and guard
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const u = JSON.parse(stored);
    if (u.userType !== "SHELTER") {
      // non-shelter users get bounced to home
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

    // append all pet fields
    Object.entries(pet).forEach(([k, v]) => formData.append(k, v));
    // automatically append shelter’s user.id
    formData.append("adoptionCenterId", user.id);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const res = await fetch(`${backendUrl}/api/pets/add`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const created = await res.json();
      alert(`Pet added! ID: ${created.id}`);
      // reset form
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
    } catch (err) {
      console.error(err);
      setError("Failed to add pet: " + err.message);
    }
  };

  // while we’re checking auth, don’t flash the form
  if (!user) {
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
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: 2 }}
              noValidate
            >
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
    </>
  );
}
