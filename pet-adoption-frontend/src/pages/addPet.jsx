import React, { useState } from "react";
import Head from "next/head";
import {
    Box, Button, Card, CardContent, Stack,
    TextField, Typography, FormControl,
    InputLabel, Select, MenuItem
} from "@mui/material";

export default function AddPet() {
    const [pet, setPet] = useState({
        name: "", age: "", species: "", breed: "",
        gender: "", healthStatus: "", coatLength: "",
        weight: "", description: "", adoptionCenterId: ""
    });
    const [file, setFile] = useState(null);

    const OPTIONS = {
        species: ["Dog","Cat"],
        gender: ["Male","Female","Other"],
        healthStatus: ["Excellent","Good","Fair","Poor"],
        coatLength: ["Hairless","Short","Medium","Long"]
    };

    const handleChange = e =>
        setPet({ ...pet, [e.target.name]: e.target.value });

    const handleFile = e =>
        setFile(e.target.files[0]);

    const handleSubmit = async e => {
        e.preventDefault();
        const URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const form = new FormData();
        Object.entries(pet).forEach(([k,v]) => form.append(k, v));
        if (file) form.append("image", file);

        const res = await fetch(`${URL}/api/pets/add`, {
            method: "POST",
            body: form
        });

        if (res.ok) {
            alert("Added!");
            setPet({ name:"",age:"",species:"",breed:"",gender:"",healthStatus:"",coatLength:"",weight:"",description:"",adoptionCenterId:"" });
            setFile(null);
        } else {
            alert("Error: " + res.status);
        }
    };

    return (
        <>
            <Head><title>Add Pet</title></Head>
            <Stack p={4} alignItems="center">
                <Card sx={{ width: 600 }} elevation={4}>
                    <CardContent>
                        <Typography variant="h4" align="center" gutterBottom>
                            Add a New Pet
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Stack spacing={2}>
                                <TextField label="Name" name="name" value={pet.name}
                                           onChange={handleChange} required />
                                <TextField label="Age" name="age" value={pet.age}
                                           onChange={handleChange} type="number" required />

                                {/* Dropdowns */}
                                {["species","gender","healthStatus","coatLength"].map(field => (
                                    <FormControl fullWidth required key={field}>
                                        <InputLabel>{field}</InputLabel>
                                        <Select
                                            label={field}
                                            name={field}
                                            value={pet[field]}
                                            onChange={handleChange}
                                        >
                                            {OPTIONS[field].map(opt => (
                                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ))}

                                <TextField label="Breed" name="breed" value={pet.breed}
                                           onChange={handleChange} required />
                                <TextField label="Weight (lbs)" name="weight"
                                           value={pet.weight} type="number"
                                           onChange={handleChange} required />
                                <TextField label="Description" name="description"
                                           value={pet.description} onChange={handleChange}
                                           multiline rows={3} />

                                <TextField label="Adoption Center ID"
                                           name="adoptionCenterId"
                                           value={pet.adoptionCenterId}
                                           onChange={handleChange}
                                           type="number" required />

                                <input type="file" onChange={handleFile} />
                                <Button type="submit" variant="contained">
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
