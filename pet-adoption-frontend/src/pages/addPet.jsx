// pages/add-pet.js
import React, { useState } from "react";
import Head from "next/head";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";

export default function AddPet() {
    const [pet, setPet] = useState({
        name: "",
        age: "",
        species: "",
        breed: "",
        gender: "",
        healthStatus: "",
        description: "",
        adoptionCenterId: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        setPet({ ...pet, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080";
        const formData = new FormData();

        // Append pet details
        formData.append("name", pet.name);
        formData.append("age", pet.age);
        formData.append("species", pet.species);
        formData.append("breed", pet.breed);
        formData.append("gender", pet.gender);
        formData.append("healthStatus", pet.healthStatus);
        formData.append("description", pet.description);
        formData.append("adoptionCenterId", pet.adoptionCenterId);

        // Append file if selected
        if (selectedFile) {
            formData.append("image", selectedFile);
        }

        try {
            const response = await fetch(`${backendUrl}/api/pets/add`, {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                alert("Pet added successfully: " + JSON.stringify(data));
                // Reset the form
                setPet({
                    name: "",
                    age: "",
                    species: "",
                    breed: "",
                    gender: "",
                    healthStatus: "",
                    description: "",
                    adoptionCenterId: ""
                });
                setSelectedFile(null);
            } else {
                alert("Failed to add pet, status: " + response.status);
            }
        } catch (error) {
            console.error("Error adding pet:", error);
            alert("Error adding pet, please check the console for details.");
        }
    };

    return (
        <>
            <Head>
                <title>Add Pet</title>
            </Head>
            <Stack sx={{ padding: 4 }} alignItems="center">
                <Card sx={{ width: 600 }} elevation={4}>
                    <CardContent>
                        <Typography variant="h4" align="center" gutterBottom>
                            Add a New Pet
                        </Typography>
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
                                    value={pet.age}
                                    onChange={handleChange}
                                    required
                                    type="number"
                                />
                                <TextField
                                    label="Species"
                                    name="species"
                                    value={pet.species}
                                    onChange={handleChange}
                                    required
                                />
                                <TextField
                                    label="Breed"
                                    name="breed"
                                    value={pet.breed}
                                    onChange={handleChange}
                                    required
                                />
                                <TextField
                                    label="Gender"
                                    name="gender"
                                    value={pet.gender}
                                    onChange={handleChange}
                                    required
                                />
                                <TextField
                                    label="Health Status"
                                    name="healthStatus"
                                    value={pet.healthStatus}
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
                                <TextField
                                    label="Adoption Center ID"
                                    name="adoptionCenterId"
                                    value={pet.adoptionCenterId}
                                    onChange={handleChange}
                                    required
                                    type="number"
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
