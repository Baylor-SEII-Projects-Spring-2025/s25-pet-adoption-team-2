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

  // Load user on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
      setIsLoggedIn(true);
    }
  }, []);

  // Pet‐rating callback
  const handleRatePet = async (petId, rating) => {
    if (!user?.id) {
      console.error("No user ID");
      return;
    }
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/user/rate`,
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

  return (
    <>
      <Head>
        <title>Pet Adoption – Home</title>
      </Head>

      {/* Use shared NavBar */}
      <NavBar />

      <main>
        {/* Hero Section */}
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
            {isShelter ? (
              <>
                <Typography variant="h2" gutterBottom>
                  Welcome, {user.shelterName || "Shelter"}!
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

        {/* Info Card */}
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Card elevation={4}>
            <CardContent>
              <Typography variant="h3" align="center">
                Pet Adoption
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {isShelter
                  ? "Post animals for adoption and help them find a loving home."
                  : "Browse pets available for adoption and find your new best friend."}
              </Typography>
            </CardContent>
          </Card>
        </Container>

        {/* Recommendations */}
        {!isShelter && isLoggedIn && (
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

        {/* Event Buttons */}
        <Container sx={{ textAlign: "center", mb: 4 }}>
          {isShelter ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/ShelterEventsPage")}
            >
              Add Events (Shelter)
            </Button>
          ) : isLoggedIn ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/AdopterEventsPage")}
            >
              View Events (Adopter)
            </Button>
          ) : null}
        </Container>
      </main>
    </>
  );
}
