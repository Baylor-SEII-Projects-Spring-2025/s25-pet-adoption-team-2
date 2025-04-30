import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Image from 'next/image';

export default function ImageTest() {
  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom>
        Image Test Page
      </Typography>
      
      <Typography paragraph>
        This page tests if the background images are available at the expected paths.
        You should see both images displayed below:
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Light Mode Background:
        </Typography>
        <Box sx={{ position: 'relative', height: 300, border: '1px solid #ccc' }}>
          <img 
            src="/images/light-paw-background.png" 
            alt="Light mode background" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center'
            }} 
          />
        </Box>
        <Typography variant="caption">
          Path: /images/light-paw-background.png
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Dark Mode Background:
        </Typography>
        <Box sx={{ position: 'relative', height: 300, border: '1px solid #ccc' }}>
          <img 
            src="/images/dark-paw-background.png" 
            alt="Dark mode background" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center'
            }} 
          />
        </Box>
        <Typography variant="caption">
          Path: /images/dark-paw-background.png
        </Typography>
      </Paper>
      
      <Typography sx={{ mt: 4, color: 'red' }}>
        If you don't see the images above, they aren't at the expected paths.
        Make sure to save them in your public/images directory.
      </Typography>
    </Box>
  );
}