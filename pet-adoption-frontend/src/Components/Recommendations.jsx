import React, { useState, useEffect, useCallback, useRef } from "react";  // ← added useRef
import { Box, Button, IconButton, Rating, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PetCard from "./PetCard";

export default function Recommendations({ userId, refreshKey, onRatePet }) {
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const seenIdsRef = useRef(new Set());
  const [showDesc, setShowDesc] = useState(false);


  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const token = localStorage.getItem("jwtToken");
    const headers = token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };

    let url = `${backendUrl}/api/recommendations/${userId}`;
    if (seenIdsRef.current.size) {
      const excludeParam = Array.from(seenIdsRef.current).join(",");
      url += `?exclude=${excludeParam}`;
    }

    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error("Failed to fetch recs:", res.status);
        if (res.status === 401) console.log("Unauthorized - please log in.");
        return;
      }
      const data = await res.json();
      setPets(data);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error fetching recs:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations, refreshKey]);

  const handleNext = () =>
    setCurrentIndex((i) => (pets.length ? (i + 1) % pets.length : 0));
  const handlePrev = () =>
    setCurrentIndex((i) =>
      pets.length ? (i - 1 + pets.length) % pets.length : 0
    );

  const currentPet = pets[currentIndex];

  const handleRatingChange = async (_, rating) => {
    if (!currentPet || rating == null) return;

    await onRatePet(currentPet.id, rating);
    seenIdsRef.current.add(currentPet.id);
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
        py: 2
      }}
    >
      <IconButton
        onClick={handlePrev}
        sx={{ position: "absolute", left: 0 }}
        aria-label="previous"
      >
        <ArrowBackIosIcon />
      </IconButton>

      <Box sx={{ width: 280 }}>
        <PetCard pet={currentPet}>
          {/* description toggle */}
          <Box sx={{ textAlign: "center", my: 1 }}>
            <Button
              size="small"
              onClick={() => setShowDesc((s) => !s)}
            >
              {showDesc ? "Hide Description" : "Show Description"}
            </Button>
            {showDesc && (
              <Typography
                variant="body2"
                sx={{ mt: 1, px: 1 }}
              >
                {currentPet.description}
              </Typography>
            )}
          </Box>

          {/* rating */}
          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Rating
              name="rating"
              value={currentPet.rating || 0}
              onChange={handleRatingChange}
            />
          </Box>
    </PetCard>
      </Box>

      <IconButton
        onClick={handleNext}
        sx={{ position: "absolute", right: 0 }}
        aria-label="next"
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
}
