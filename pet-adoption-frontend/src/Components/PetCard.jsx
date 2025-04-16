import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';

const PetCard = ({ pet, children }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {pet.imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={pet.imageUrl}
          alt={pet.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
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
          Status: {pet.status}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PetCard; 