// pages/index.jsx
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Box, 
  Button, 
  Container, 
  Card, 
  CardContent, 
  Typography 
} from "@mui/material";
import Image from "next/image";
import NavBar from "./NavBar";           
import Recommendations from "../Components/Recommendations";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load user from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
      setIsLoggedIn(true);
    }
  }, []);

  // Rating handler
  const handleRatePet = async (petId, rating) => {
    if (!user?.id) return console.error("No user ID");
    try {
      const res = await fetch("http://localhost:8080/api/user/rate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, petId, rating }),
      });
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

  return (
    <>
      <Head>
        <title>Pet Adoption – Home</title>
      </Head>

      {/* your shared NavBar */}
      <NavBar />

      <main>
        {/* Hero section */}
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
          {/* background image */}
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          >
            <Image
              src="/images/krista-mangulsone-9gz3wfHr65U-unsplash.jpg"
              alt="Hero"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </Box>

          {/* overlay text & button */}
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
            {user?.userType === "SHELTER" ? (
              <>
                <Typography variant="h2" gutterBottom>
                  Welcome, {user.shelterName || "Shelter"}!
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Post an Animal for Adoption Today!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => router.push("/addPet")}
                >
                  Post Animal
                </Button>
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

        {/* Info card */}
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Card elevation={4}>
            <CardContent>
              <Typography variant="h3" align="center">
                Pet Adoption
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
              >
                {isLoggedIn && user.userType === "SHELTER"
                  ? "Post animals for adoption and help them find a loving home."
                  : "Browse through pets available for adoption and find your new best friend."}
              </Typography>
            </CardContent>
          </Card>
        </Container>

        {/* Recommendations */}
        {isLoggedIn && user.userType !== "SHELTER" && (
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

        {/* Events buttons */}
        <Container sx={{ textAlign: "center", mb: 4 }}>
          {isLoggedIn && user.userType === "SHELTER" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/ShelterEventsPage")}
              sx={{ mr: 2 }}
            >
              Add Events (Shelter)
            </Button>
          )}
          {isLoggedIn && user.userType !== "SHELTER" && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/AdopterEventsPage")}
            >
              View Events (Adopter)
            </Button>
          )}
        </Container>
      </main>
    </>
  );
}
