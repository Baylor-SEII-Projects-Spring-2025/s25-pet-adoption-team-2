// components/PetCard.jsx
import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';

export default function PetCard({ pet, children }) {
  // Base URL for images on backend
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

  // Determine the correct image URL
  const getImageUrl = () => {
    // 1) No image → default placeholder on backend
    if (!pet.imageUrl || pet.imageUrl.trim() === '') {
      return `${backendUrl}/images/no-photo.png`;
    }

    // 2) Absolute URL → return as-is
    if (pet.imageUrl.startsWith('http')) {
      return pet.imageUrl;
    }

    // 3) Relative path → prefix with backend URL
    return `${backendUrl}${pet.imageUrl}`;
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }} elevation={3}>
      <CardMedia
        component="img"
        height="200"
        image={getImageUrl()}
        alt={pet.name || 'Pet'}
        sx={{ objectFit: 'cover' }}
        onError={e => {
          e.target.onerror = null;
          e.target.src = `${backendUrl}/images/no-photo.png`;
        }}
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
          Weight: {pet.weight}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
        Health: {pet.healthStatus}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
        Description: {pet.description}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
        Available: {pet.available ? 'Yes' : 'No'}
        </Typography>
        {/* Additional fields... */}
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
