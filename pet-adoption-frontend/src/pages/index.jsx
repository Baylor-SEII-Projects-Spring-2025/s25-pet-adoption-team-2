import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  AppBar,
  Avatar,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Box,
  Toolbar,
  Menu,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import Recommendations from "../Components/Recommendations";



export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // On mount, check session storage for a logged-in user.
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    router.push("/login");
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    router.push("/profile");
    handleMenuClose();
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRatePet = async (petId, rating) => {
    if (!user || !user.id || !petId || rating == null) {
      console.error("Missing required fields for rating:", { userId: user ? user.id : null, petId, rating });
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/api/user/rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, petId, rating }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        console.log("Rating processed; user preferences updated.");
        setRefreshKey(prev => prev + 1);
      } else {
        console.error("Failed to update rating and preferences");
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };


  return (
    <>
      <Head>
        <title>Pet Adoption - Home</title>
      </Head>

      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          {/* Logo on the left */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <Image
              src="/images/Home_Fur_Good_Logo.jpeg"
              alt="Home Fur Good Logo"
              width={50}
              height={50}
              priority
            />
          </Box>

          {/* Title */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Home Fur Good
          </Typography>

          {/* Right side: user menu or login/signup */}
          {isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user?.email}
              </Typography>
              <Avatar
                sx={{ bgcolor: "secondary.main", cursor: "pointer" }}
                onClick={handleProfileMenuOpen}
              >
                {(user?.email || "").charAt(0).toUpperCase()}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Button color="inherit" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button color="inherit" onClick={() => router.push("/signup")}>
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          height: "400px",
          position: "relative",
          overflow: "hidden",
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.light",
        }}
      >
        {/* Background Image */}
        <Box
          sx={{ position: "absolute", zIndex: 1, width: "100%", height: "100%" }}
        >
          <Image
            src="/images/krista-mangulsone-9gz3wfHr65U-unsplash.jpg"
            alt="Pet adoption hero image"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        </Box>

        {/* Foreground Text & Button */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            p: 4,
            borderRadius: 2,
          }}
        >
          {user?.userType === "SHELTER" ? (
            <>
              <Typography
                variant="h2"
                component="h1"
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Welcome, {user?.shelterName || "Shelter"}!
              </Typography>
              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                Post an Animal for Adoption Today!
              </Typography>
              <Button
                variant="contained"
                size="large"
                color="secondary"
                onClick={() => router.push("/post-animal")}
              >
                Post Animal
              </Button>
            </>
          ) : (
            <>
              <Typography
                variant="h2"
                component="h1"
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Find Your Forever Friend
              </Typography>
              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
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

      {/* A simple informational Card */}
      <Container maxWidth="lg">
        <Card sx={{ width: "100%" }} elevation={4}>
          <CardContent>
            <Typography variant="h3" align="center">
              Pet Adoption Spring 2025
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isLoggedIn && user?.userType === "SHELTER"
                ? "Post animals for adoption and help them find a loving home."
                : "Browse through pets available for adoption and find your new best friend."}
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* Recommendations for adopter users */}
      {isLoggedIn && user?.userType !== "SHELTER" && (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Recommended Pets
          </Typography>
          <Recommendations userId={user.id} refreshKey={refreshKey} onRatePet={handleRatePet} />
        </Container>
      )}
    </>
  );
}
