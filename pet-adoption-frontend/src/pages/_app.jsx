import dynamic from "next/dynamic";
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Provider as ReduxProvider } from "react-redux";
import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import { CssBaseline, Box } from "@mui/material";
import { PetAdoptionThemeProvider } from "@/utils/theme";
import { buildStore } from "@/utils/redux";
import "@/styles/globals.css";

const NavBar = dynamic(() => import("@/pages/NavBar"), { ssr: false });
const FloatingThemeToggle = dynamic(
  () => import("@/Components/FloatingThemeToggle"),
  { ssr: false }
);

let reduxStore = buildStore({});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideNavPaths = ["/", "/login", "/signup", "/easteregg"];
  const hideTogglePaths = ["/easteregg"];

  const showNav = !hideNavPaths.includes(router.pathname);
  const showToggle = !hideTogglePaths.includes(router.pathname);

  return (
    <ReduxProvider store={reduxStore}>
      <AppCacheProvider>
        <Head>
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PetAdoptionThemeProvider>
          <CssBaseline enableColorScheme />
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {showNav && <NavBar />}
            <Component {...pageProps} />
            {showToggle && <FloatingThemeToggle />}
          </Box>
        </PetAdoptionThemeProvider>
      </AppCacheProvider>
    </ReduxProvider>
  );
}
