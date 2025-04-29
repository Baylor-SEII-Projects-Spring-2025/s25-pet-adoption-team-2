import React from "react";
import Head from "next/head";
import { Provider as ReduxProvider } from "react-redux";
import { useRouter } from "next/router";

import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import { CssBaseline } from "@mui/material";

import { PetAdoptionThemeProvider } from "@/utils/theme";
import { buildStore } from "@/utils/redux";
import NavBar from "@/pages/NavBar";

import "@/styles/globals.css";

// Initialize Redux
let initialState = {};
let reduxStore = buildStore(initialState);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideNavPaths = ["/", "/login", "/signup"];

  return (
    <ReduxProvider store={reduxStore}>
      <AppCacheProvider>
        <Head>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <PetAdoptionThemeProvider>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />

          {/* Global Navigation Bar: hidden on homepage, login, signup */}
          {!hideNavPaths.includes(router.pathname) && <NavBar />}

          {/* Page Content */}
          <Component {...pageProps} />
        </PetAdoptionThemeProvider>
      </AppCacheProvider>
    </ReduxProvider>
  );
}
