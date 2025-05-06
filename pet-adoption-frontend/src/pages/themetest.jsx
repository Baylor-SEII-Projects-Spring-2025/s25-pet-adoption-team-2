import React from 'react';
import { Box, Typography, Paper, Button, Card, CardContent, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '@/utils/theme';

export default function ThemeTest() {
  const theme = useTheme();
  const colorMode = useColorMode();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box sx={{ 
      p: 4, 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      color: 'text.primary'
    }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        Theme Test Page - {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              This is a Paper component
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              The background color and text color of this paper should change with the theme.
              Notice if this component properly inherits theme colors.
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'background.default', 
              borderRadius: 1,
              mb: 3
            }}>
              <Typography>
                This box should show the default background color of the current theme.
              </Typography>
            </Box>
            <Button variant="contained" color="primary" sx={{ mr: 2 }}>
              Primary Button
            </Button>
            <Button variant="contained" color="secondary">
              Secondary Button
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Card Component Test
              </Typography>
              <Typography variant="body1">
                Cards should also inherit the theme colors. In dark mode, this card should
                have a darker background. In light mode, it should have a lighter background.
              </Typography>
            </CardContent>
          </Card>
          
          <Box sx={{ 
            p: 3, 
            border: 1, 
            borderColor: 'primary.main',
            borderRadius: 1,
            mb: 4
          }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              Primary Color Text
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              This text should be in the normal text color, and the border and heading should
              use the primary color of the current theme.
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            onClick={colorMode.toggleColorMode} 
            sx={{ 
              display: 'block',
              mx: 'auto',
              mb: 2
            }}
          >
            Toggle Theme (Additional Test Button)
          </Button>
          
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
            Current theme palette:
            Primary: {theme.palette.primary.main},
            Secondary: {theme.palette.secondary.main},
            Background: {theme.palette.background.default}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}