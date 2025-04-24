import React, { useState } from "react";
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
} from "@mui/material";

export default function AddPet() {
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
        adoptionCenterId: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);

    // Dropdown options
    const speciesOptions = ["Dog", "Cat"];
    const genderOptions = ["Male", "Female", "Other"];
    const healthStatusOptions = ["Excellent", "Good", "Fair", "Poor"];
    const coatLengthOptions = ["Hairless", "Short", "Medium", "Long"];

    const handleChange = (e) => {
        setPet({ ...pet, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080";
        const formData = new FormData();

        // Append pet details (breed is now just a text field)
        formData.append("name", pet.name);
        formData.append("age", pet.age);
        formData.append("species", pet.species);
        formData.append("breed", pet.breed);
        formData.append("gender", pet.gender);
        formData.append("healthStatus", pet.healthStatus);
        formData.append("coatLength", pet.coatLength);
        formData.append("weight", pet.weight);
        formData.append("description", pet.description);
        formData.append("adoptionCenterId", pet.adoptionCenterId);

        // Append the image file, if one was selected
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
                    coatLength: "",
                    weight: "",
                    description: "",
                    adoptionCenterId: "",
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
                                {/* Species Dropdown */}
                                <FormControl fullWidth required>
                                    <InputLabel>Species</InputLabel>
                                    <Select
                                        label="Species"
                                        name="species"
                                        value={pet.species}
                                        onChange={handleChange}
                                    >
                                        {speciesOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* Breed as a free-text field */}
                                <TextField
                                    label="Breed"
                                    name="breed"
                                    value={pet.breed}
                                    onChange={handleChange}
                                    required
                                />
                                {/* Gender Dropdown */}
                                <FormControl fullWidth required>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        label="Gender"
                                        name="gender"
                                        value={pet.gender}
                                        onChange={handleChange}
                                    >
                                        {genderOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* Health Status Dropdown */}
                                <FormControl fullWidth required>
                                    <InputLabel>Health Status</InputLabel>
                                    <Select
                                        label="Health Status"
                                        name="healthStatus"
                                        value={pet.healthStatus}
                                        onChange={handleChange}
                                    >
                                        {healthStatusOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* Coat Length Dropdown */}
                                <FormControl fullWidth required>
                                    <InputLabel>Coat Length</InputLabel>
                                    <Select
                                        label="Coat Length"
                                        name="coatLength"
                                        value={pet.coatLength}
                                        onChange={handleChange}
                                    >
                                        {coatLengthOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* Weight Input */}
                                <TextField
                                    label="Weight (lbs)"
                                    name="weight"
                                    value={pet.weight}
                                    onChange={handleChange}
                                    required
                                    type="number"
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
                                {/* File Input */}
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
