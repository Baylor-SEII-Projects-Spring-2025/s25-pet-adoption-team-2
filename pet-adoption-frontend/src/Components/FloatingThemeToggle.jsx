import React from 'react';
import { Fab, Tooltip, useTheme, Zoom } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '@/utils/theme';

const FloatingThemeToggle = () => {
  const theme = useTheme();
  const colorMode = useColorMode();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Zoom in={true} timeout={500}>
      <Tooltip 
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        placement="left"
      >
        <Fab
          color="primary"
          size="medium"
          aria-label="toggle dark/light mode"
          onClick={colorMode.toggleColorMode}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: theme.palette.mode === 'dark' ? '0 0 10px rgba(100, 181, 246, 0.5)' : '0 0 10px rgba(255, 138, 101, 0.5)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: theme.palette.mode === 'dark' ? '0 0 15px rgba(100, 181, 246, 0.7)' : '0 0 15px rgba(255, 138, 101, 0.7)',
            },
            zIndex: 1300
          }}
        >
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default FloatingThemeToggle;