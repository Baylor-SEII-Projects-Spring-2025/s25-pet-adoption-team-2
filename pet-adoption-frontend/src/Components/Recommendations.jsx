// components/Recommendations.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Image from "next/image";
//import PetCard from "../Components/PetCard"; // or "./PetCard" depending on your folder

export default function Recommendations({ userId, refreshKey, onRatePet }) {
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1) Extract fetch into a stable callback
  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const token = localStorage.getItem('jwtToken');

    try {
      const res = await fetch(`${backendUrl}/api/recommendations/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        console.error("Failed to fetch recs:", res.status);
        if (res.status === 401) {
          console.log("Unauthorized - please log in.");
        }
        return;
      }
      const data = await res.json();
      setPets(data);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error fetching recs:", err);
    }
  }, [userId]);

  // 2) Call it on mount, userId change, or refreshKey bump
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations, refreshKey]);

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % pets.length);
  };
  const handlePrev = () => {
    setCurrentIndex((i) => (i - 1 + pets.length) % pets.length);
  };

  const currentPet = pets[currentIndex];

  // 3) After you rate, call the parent AND re–fetch immediately
  const handleRatingChange = async (_, rating) => {
    if (!currentPet || rating == null) return;
    await onRatePet(currentPet.id, rating);
    // now force a fresh load
    fetchRecommendations();
  };

  if (!pets.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>No recommendations available.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <IconButton onClick={handlePrev} sx={{ position: "absolute", left: 0 }}>
        <ArrowBackIosIcon />
      </IconButton>

      <Card sx={{ maxWidth: 360, mx: 2 }}>
        <Box sx={{ position: "relative", height: 200, width: "100%" }}>
          <Image
            src={currentPet.imageUrl || "/images/no-photo.png"}
            alt={currentPet.name}
            fill
            unoptimized
            style={{ objectFit: "cover" }}
          />
        </Box>
        <CardContent>
          <Typography variant="h6">{currentPet.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {currentPet.breed} • {currentPet.gender} • {currentPet.species}
          </Typography>
          <Rating
            name="rating"
            value={currentPet.rating || 0}
            onChange={handleRatingChange}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      <IconButton
        onClick={handleNext}
        sx={{ position: "absolute", right: 0 }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
}
