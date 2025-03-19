// components/PetCard.jsx
import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";

export default function PetCard({ pet }) {
    // Fallback image in case pet.imageUrl is empty
    const displayedImage =
        pet.imageUrl && pet.imageUrl.trim() !== ""
            ? pet.imageUrl
            : "/images/no-photo.png"; // ensure this fallback exists in /public/images

    return (
        <Card sx={{ maxWidth: 345, m: 2 }}>
            <CardMedia
                component="img"
                height="200"
                image={displayedImage}
                alt={pet.name || "Pet"}
            />
            <CardContent>
                <Typography variant="h5" component="div">
                    {pet.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Age: {pet.age} <br />
                    Species: {pet.species} <br />
                    Breed: {pet.breed} <br />
                    Gender: {pet.gender} <br />
                    Health: {pet.healthStatus} <br />
                    Description: {pet.description} <br />
                    Status: {pet.status} <br />
                    Available: {pet.available ? "Yes" : "No"}
                </Typography>
            </CardContent>
        </Card>
    );
}
