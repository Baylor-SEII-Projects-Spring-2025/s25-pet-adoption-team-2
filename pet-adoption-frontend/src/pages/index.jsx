import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import Image from "next/image";
import NavBar from "./NavBar"; 
import Recommendations from "../Components/Recommendations"; 

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Failed to parse user from session storage:", e);
        sessionStorage.removeItem("user"); 
      }
    }
  }, []);

  const handleRatePet = async (petId, rating) => {
    if (!user?.id) {
      console.error("No user ID");
      return;
    }
    try {
      const token = localStorage.getItem("jwtToken");
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080";
      const res = await fetch(
        `${BACKEND}/api/user/rate`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined, 
          },
          body: JSON.stringify({ userId: user.id, petId, rating }),
        }
      );
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      const updated = json.user || json; 
      setUser(updated);
      sessionStorage.setItem("user", JSON.stringify(updated));
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error("Rating error:", e);
    }
  };

  const isShelter = user?.userType === "SHELTER";
  const isAdmin = user?.userType === "ADMIN"; 

  return (
    <>
      <Head>
        <title>Pet Adoption – Home</title>
      </Head>

      <NavBar />

      <main>
        <Box
          sx={{
            height: 400,
            position: "relative",
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.light",
          }}
        >
          <Box
            sx={{ position: "absolute", width: "100%", height: "100%", zIndex: 1 }}
          >
            <Image
              src="/images/krista-mangulsone-9gz3wfHr65U-unsplash.jpg" 
              alt="Hero"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              p: 4,
              borderRadius: 2,
            }}
          >
            {isAdmin ? (
              <>
                <Typography variant="h2" gutterBottom>
                  Admin Portal Access
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Manage users and pets from your dashboard.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => router.push("/profile")}
                >
                  Go to Admin Dashboard
                </Button>
              </>
            ) : isShelter ? (
              <>
                <Typography variant="h2" gutterBottom>
                  Welcome, {user?.shelterName || "Shelter"}!
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Post an Animal for Adoption Today!
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => router.push("/addPet")}
                  >
                    Post Animal
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => router.push("/adopt")}
                  >
                    See All Future Pets
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography variant="h2" gutterBottom>
                  Find Your Forever Friend
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Adopt a pet and change both your lives for the better
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => router.push("/adopt")}
                >
                  Browse Available Pets
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Card elevation={4}>
            <CardContent>
              <Typography variant="h3" align="center">
                {isAdmin ? "Admin Portal" : "Pet Adoption"}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {isAdmin
                  ? "Manage application users and pet listings."
                  : isShelter
                  ? "Post animals for adoption and help them find a loving home."
                  : "Browse pets available for adoption and find your new best friend."}
              </Typography>
            </CardContent>
          </Card>
        </Container>

        {!isShelter && !isAdmin && isLoggedIn && user?.id && (
          <Container maxWidth="lg" sx={{ mb: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Recommended Pets
            </Typography>
            <Recommendations
              userId={user.id}
              refreshKey={refreshKey}
              onRatePet={handleRatePet}
            />
          </Container>
        )}

        {!isAdmin && (
          <Container sx={{ textAlign: "center", mb: 4 }}>
            {isShelter ? (
              <Stack spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ maxWidth: 300 }}
                  onClick={() => router.push("/ShelterEventsPage")}
                >
                  Add Events (Shelter)
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ maxWidth: 300 }}
                  onClick={() => router.push("/ScheduledEventsPage")}
                >
                  Scheduled Events (Shelter)
                </Button>
              </Stack>
            ) : isLoggedIn ? (
              <Stack spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ maxWidth: 300 }}
                  onClick={() => router.push("/AdopterEventsPage")}
                >
                  Add Events (Adopter)
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ maxWidth: 300 }}
                  onClick={() => router.push("/JoinedEventsPage")}
                >
                  Scheduled Events (Adopter)
                </Button>
              </Stack>
            ) : null}
          </Container>
        )}
      </main>
    </>
  );
}