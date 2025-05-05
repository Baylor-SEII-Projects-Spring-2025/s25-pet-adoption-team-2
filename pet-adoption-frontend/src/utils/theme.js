import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";

// Define the palette for both modes
const lightModeColors = {
  primary: {
    main: "#76B5B9", // A blue that matches the paw prints in light mode
    light: "#42a5f5",
    dark: "#1565c0",
    contrastText: "#fff",
  },
  secondary: {
    main: "#ff8a65", // Orange/peach from the light mode background
    light: "#ffab91",
    dark: "#e57373",
    contrastText: "#000",
  },
  background: {
    default: "#fff8e1", // Light peach/orange background
    paper: "#fff3e0",
  },
  text: {
    primary: "#424242",
    secondary: "#757575",
  },
};

const darkModeColors = {
  primary: {
    main: "#2196f3", // Bright blue for paw prints in dark mode
    light: "#64b5f6",
    dark: "#1976d2",
    contrastText: "#fff",
  },
  secondary: {
    main: "#90caf9", // Lighter blue for accents
    light: "#bbdefb",
    dark: "#64b5f6",
    contrastText: "#000",
  },
  background: {
    default: "#0d1b2a", // Very dark blue background from the image
    paper: "#1a2a38",
  },
  text: {
    primary: "#ffffff",
    secondary: "#b0bec5",
  },
};

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light' ? lightModeColors : darkModeColors),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-image: ${mode === 'light' 
            ? 'url("/images/light-paw-background.png")' 
            : 'url("/images/dark-paw-background.png")'};
          background-size: cover;
          background-repeat: repeat;
          background-color: ${mode === 'light' ? '#fff8e1' : '#0d1b2a'} !important;
          transition: all 0.3s ease;
        }
      `,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: 8,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          margin: 4,
          transition: 'all 0.3s ease',
        },
        outlinedPrimary: {
          border: "2px solid",
        },
        outlinedSecondary: {
          border: "2px solid",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
        },
      },
    },
  },
  typography: {
    fontFamily: "Roboto, Noto Sans, sans-serif",
    fontSize: 14,
    body2: {
      fontSize: 14,
    },
  },
  shape: {
    borderRadius: 5,
  },
});

export const ColorModeContext = React.createContext({ 
  toggleColorMode: () => {},
  mode: 'light' 
});

export const useColorMode = () => {
  return React.useContext(ColorModeContext);
};

export const PetAdoptionThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  
  // Check for saved preference in localStorage
  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('colorMode');
      if (savedMode) {
        setMode(savedMode);
        // Apply body class based on mode
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${savedMode}-mode`);
      } else {
        // Check user's system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialMode = prefersDarkMode ? 'dark' : 'light';
        setMode(initialMode);
        // Apply body class based on mode
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${initialMode}-mode`);
      }
    }
  }, []);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          // Only access localStorage on the client side
          if (typeof window !== 'undefined') {
            localStorage.setItem('colorMode', newMode);
            
            // Toggle body class for background image
            document.body.classList.remove('light-mode', 'dark-mode');
            document.body.classList.add(`${newMode}-mode`);
          }
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  // Create the theme and make it responsive
  const theme = React.useMemo(
    () => responsiveFontSizes(createTheme(getDesignTokens(mode))),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};