// components/Recommendations.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import PetCard from "../Components/PetCard";

export default function Recommendations({ userId }) {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    async function fetchRecommendations() {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080";
      const token = localStorage.getItem("jwtToken");

      try {
        const response = await fetch(
          `${backendUrl}/api/recommendations/${userId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch recommendations, status:",
            response.status
          );
          return;
        }

        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error("Error fetching recommendations", error);
      }
    }

    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      {pets.length === 0 ? (
        <Typography>No recommendations available.</Typography>
      ) : (
        pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
      )}
    </Box>
  );
}
