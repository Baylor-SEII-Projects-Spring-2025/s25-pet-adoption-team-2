// components/PetCard.jsx
import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';

export default function PetCard({ pet, children }) {
    // fall back to a "no photo" if the URL is missing or empty
    const displayedImage =
        pet.imageUrl && pet.imageUrl.trim() !== ''
            ? pet.imageUrl
            : '/images/no-photo.png';

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 345, m: 2 }}>
            <CardMedia
                component="img"
                height="200"
                image={displayedImage}
                alt={pet.name || 'Pet'}
                sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                    {pet.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                    Species: {pet.species}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Breed: {pet.breed}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Age: {pet.age}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Gender: {pet.gender}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Health: {pet.healthStatus}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Description: {pet.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Status: {pet.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Available: {pet.available ? 'Yes' : 'No'}
                </Typography>

                {/* any actions or extra content you pass in */}
                <Box sx={{ mt: 2 }}>
                    {children}
                </Box>
            </CardContent>
        </Card>
    );
}
