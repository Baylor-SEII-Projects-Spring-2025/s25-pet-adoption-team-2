import dynamic from "next/dynamic";
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Provider as ReduxProvider } from "react-redux";
import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import { CssBaseline, Box } from "@mui/material";
import { PetAdoptionThemeProvider } from "@/utils/theme";
import { buildStore } from "@/utils/redux";
// Dynamic imports
const NavBar = dynamic(() => import("@/pages/NavBar"), { ssr: false });
const FloatingThemeToggle = dynamic(() => import("@/components/FloatingThemeToggle"), { ssr: false });
import "@/styles/globals.css";

let reduxStore = buildStore({});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideNavPaths = ["/", "/login", "/signup"];
  
  return (
    <ReduxProvider store={reduxStore}>
      {/* The AppCacheProvider should be outside the ThemeProvider to avoid conflicts */}
      <AppCacheProvider>
        <Head>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PetAdoptionThemeProvider>
          {/* CssBaseline should be inside ThemeProvider to apply theme styles */}
          <CssBaseline enableColorScheme />
          <Box sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            // Background will be set by CssBaseline, this ensures minimum height
          }}>
            {!hideNavPaths.includes(router.pathname) && <NavBar />}
            <Component {...pageProps} />
            <FloatingThemeToggle />
          </Box>
        </PetAdoptionThemeProvider>
      </AppCacheProvider>
    </ReduxProvider>
  );
}