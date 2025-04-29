import dynamic from "next/dynamic";
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Provider as ReduxProvider } from "react-redux";
import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import { CssBaseline } from "@mui/material";
import { PetAdoptionThemeProvider } from "@/utils/theme";
import { buildStore } from "@/utils/redux";

// instead of importing NavBar statically:
const NavBar = dynamic(() => import("@/pages/NavBar"), { ssr: false });

import "@/styles/globals.css";

let reduxStore = buildStore({});

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
          <CssBaseline />

          {!hideNavPaths.includes(router.pathname) && <NavBar />}

          <Component {...pageProps} />
        </PetAdoptionThemeProvider>
      </AppCacheProvider>
    </ReduxProvider>
  );
}
