import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Rating } from "@mui/material";

const Recommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    console.log("Fetching recommendations for user:", userId);
    async function fetchRecommendations() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const response = await fetch(`${backendUrl}/api/recommendations/${userId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched recommendations:", data);
          setRecommendations(data);
        } else {
          console.error("Failed to fetch recommendations, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching recommendations", error);
      }
    }
    fetchRecommendations();
  }, [userId]);

  const handleRatingChange = (petId, newRating) => {
    console.log(`Pet ${petId} rated ${newRating}`);
    // TODO: i have to actually send this to the backend later
  };

  return (
    <Box sx={{ overflowX: "auto", display: "flex", gap: 2, p: 2 }}>
      {recommendations.map((pet) => (
        <Card key={pet.id} sx={{ minWidth: 250 }}>
          <img
            src={pet.imageUrl}
            alt="pet"
            style={{ width: "100%", height: 150, objectFit: "cover" }}
          />
          <CardContent>
            <Typography variant="body1">{pet.description}</Typography>
            <Rating
              name={`rating-${pet.id}`}
              value={pet.rating}
              onChange={(event, newValue) =>
                handleRatingChange(pet.id, newValue)
              }
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Recommendations;
