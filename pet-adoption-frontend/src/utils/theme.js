import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

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
    default: "transparent", // Changed to transparent to show the background image
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
    default: "transparent", // Changed to transparent to show the background image
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
  typography: {
    fontFamily: "'MilkyWay', Roboto, Noto Sans, sans-serif",
    fontSize: 14,
    // Headline variants
    h6: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
      fontWeight: 75, 
      letterSpacing: '1px', 
      textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.2)', 
    },
    // Add explicit font family for other typography variants
    h1: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    h2: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    h3: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    h4: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    h5: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    // Body text variants
    body1: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    body2: {
      fontSize: 14,
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    // Additional typography variants
    subtitle1: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    subtitle2: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    button: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    caption: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
    overline: {
      fontFamily: "'MilkyWay', Roboto, sans-serif",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'MilkyWay';
          src: url('/fonts/MilkyWay.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
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
  
  // Function to apply body classes for background images
  const applyBodyClass = (newMode) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('light-mode', 'dark-mode');
      document.body.classList.add(`${newMode}-mode`);
    }
  };
  
  // Check for saved preference in localStorage
  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('colorMode');
      if (savedMode) {
        setMode(savedMode);
        applyBodyClass(savedMode);
      } else {
        // Check user's system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialMode = prefersDarkMode ? 'dark' : 'light';
        setMode(initialMode);
        applyBodyClass(initialMode);
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
            applyBodyClass(newMode);
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
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};