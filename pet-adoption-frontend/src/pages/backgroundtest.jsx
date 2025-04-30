import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useColorMode } from '@/utils/theme';

export default function BackgroundTest() {
  const colorMode = useColorMode();
  
  // Direct style approach rather than relying on theme
  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    // We'll set this explicitly based on current mode
    backgroundImage: colorMode.mode === 'light' 
      ? 'url("/images/light-paw-background.png")' 
      : 'url("/images/dark-paw-background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'repeat',
    // Ensure no other background colors are applied
    backgroundColor: colorMode.mode === 'light' ? '#fff8e1' : '#0d1b2a',
    color: colorMode.mode === 'light' ? '#424242' : '#ffffff',
  };

  return (
    <div style={containerStyle}>
      <Typography variant="h3" gutterBottom>
        Background Image Test
      </Typography>
      
      <Box sx={{ 
        backgroundColor: colorMode.mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
        p: 4,
        borderRadius: 2,
        maxWidth: 600,
        textAlign: 'center',
        mb: 4
      }}>
        <Typography variant="h5" gutterBottom>
          Current Mode: {colorMode.mode}
        </Typography>
        <Typography paragraph>
          You should see a background with paw prints. The light mode has a peach/orange 
          background with light blue paw prints. The dark mode has a dark blue background 
          with blue paw prints.
        </Typography>
        <Typography paragraph>
          If you don't see the background images changing, it might mean:
          <br />1. The image files aren't in the correct location
          <br />2. There's a CSS issue preventing the background from showing
        </Typography>
      </Box>
      
      <Button 
        variant="contained" 
        size="large"
        onClick={colorMode.toggleColorMode}
        sx={{ mb: 3 }}
      >
        Toggle Theme
      </Button>
      
      <Typography variant="body2">
        Expected image paths:
        <br />Light mode: /images/light-paw-background.png
        <br />Dark mode: /images/dark-paw-background.png
      </Typography>
    </div>
  );
}