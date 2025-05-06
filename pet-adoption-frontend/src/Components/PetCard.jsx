import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function PetCard({ pet, children }) {
  // Access MUI theme for light/dark mode
  const theme = useTheme();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://35.225.196.242:8080';

  // Theme-specific placeholder image URLs
  const placeholderUrl =
    theme.palette.mode === 'dark'
      ? `${backendUrl}/images/no-photo-dark.png`
      : `${backendUrl}/images/no-photo-light.png`;

  // Compute the correct image URL (custom, absolute, or relative)
  const getImageUrl = () => {
    if (!pet.imageUrl || pet.imageUrl.trim() === '') {
      return placeholderUrl;
    }
    if (/^https?:\/\//.test(pet.imageUrl)) {
      return pet.imageUrl;
    }
    return `${backendUrl}${pet.imageUrl}`;
  };

  const imgUrl = getImageUrl();

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }} elevation={3}>
      <CardMedia
        component="img"
        height="200"
        image={imgUrl}
        alt={pet.name || 'Pet'}
        sx={{ objectFit: 'cover' }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = placeholderUrl;
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
          Available: {pet.available ? 'Yes' : 'No'}
        </Typography>
        {/* Extra content (e.g., action buttons) */}
        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
