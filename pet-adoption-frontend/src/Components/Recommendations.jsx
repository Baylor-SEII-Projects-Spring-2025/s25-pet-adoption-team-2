// components/Recommendations.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Recommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchRecommendations() {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      try {
        const response = await fetch(`${backendUrl}/api/recommendations/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
          setCurrentIndex(0); // resetting index when new data arrives
        } else {
          console.error("Failed to fetch recommendations, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching recommendations", error);
      }
    }
    fetchRecommendations();
  }, [userId]);

  const handleNext = () => {
    if (recommendations.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
    }
  };

  const handlePrev = () => {
    if (recommendations.length > 0) {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + recommendations.length) % recommendations.length
      );
    }
  };

  if (recommendations.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
        <Typography>No recommendations available.</Typography>
      </Box>
    );
  }

  const currentPet = recommendations[currentIndex];

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <IconButton
        onClick={handlePrev}
        sx={{
          position: "absolute",
          left: 0,
          zIndex: 2,
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>
      <Card sx={{ minWidth: 250, maxWidth: 400 }}>
        <img
          src={currentPet.imageUrl}
          alt="pet"
          style={{ width: "100%", height: 200, objectFit: "cover" }}
        />
        <CardContent>
          <Typography variant="body1">{currentPet.description}</Typography>
          <Rating
            name={`rating-${currentPet.id}`}
            value={currentPet.rating}
            onChange={(event, newValue) =>
              console.log(`Pet ${currentPet.id} rated ${newValue}`)
            }
          />
        </CardContent>
      </Card>
      <IconButton
        onClick={handleNext}
        sx={{
          position: "absolute",
          right: 0,
          zIndex: 2,
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

export default Recommendations;
