import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";

export default function PetCard({ pet }) {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const src = pet.imageUrl
        ? (pet.imageUrl.startsWith("http") ? pet.imageUrl : BACKEND + pet.imageUrl)
        : "/images/no-photo.png";

    return (
        <Card sx={{ maxWidth: 345, m: 2 }}>
            <CardMedia
                component="img"
                height="200"
                image={src}
                alt={pet.name}
            />
            <CardContent>
                <Typography variant="h5">{pet.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                    Age: {pet.age}<br />
                    Species: {pet.species}<br />
                    Breed: {pet.breed}<br />
                    Gender: {pet.gender}<br />
                    Health: {pet.healthStatus}<br />
                    Weight: {pet.weight} lbs<br />
                    Coat: {pet.coatLength}<br />
                    Description: {pet.description}<br />
                    Status: {pet.status}<br />
                    Available: {pet.available ? "Yes" : "No"}
                </Typography>
            </CardContent>
        </Card>
    );
}
