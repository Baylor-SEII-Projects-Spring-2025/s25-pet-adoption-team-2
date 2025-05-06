import React, { useState, useEffect, useCallback, useRef } from "react";  // ← added useRef
import { Box, Button, IconButton, Rating, Typography } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PetCard from "./PetCard";
import { useRouter } from "next/router";

export default function Recommendations({ userId, refreshKey, onRatePet }) {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const seenIdsRef = useRef(new Set());
  const [user, setUser] = useState(null);
  useEffect(() => {
    const s = sessionStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);
  const [showDesc, setShowDesc] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const router = useRouter();
  const [formData, setFormData] = useState({

    userId: "",
    userEmail: "",
    petId: "",
    adoptionCenterId: "",
    additionalNotes: "",
    displayName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);


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

  const handleInterest = useCallback((pet) => {
    if (!user) return router.push("/login");
    setSelectedPet(pet);
    const name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;
    setFormData({
      userId: user.id,
      userEmail: user.email,
      petId: pet.id,
      adoptionCenterId: pet.adoptionCenterId,
      additionalNotes: "",
      displayName: name,
    });
    setOpenDialog(true);
  }, [user, router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${BACKEND}/api/adoption-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      alert("Your interest has been submitted!");
      setOpenDialog(false);
    } catch (e) {
      setError(`Submission failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };



  if (!pets.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>No recommendations available.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
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
                {showDesc
                  ? "Hide Description"
                  : "Show Description"}
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

            {/* Interested button */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={() =>
                  handleInterest(currentPet)
                }
              >
                Interested!
              </Button>
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

      {/* interest */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>
          Confirm Your Interest
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            <TextField
              label="Your Name"
              value={formData.displayName}
              disabled
              fullWidth
            />
            <TextField
              label="Your Email"
              value={formData.userEmail}
              disabled
              fullWidth
            />
            <TextField
              label="Pet Name"
              value={selectedPet?.name || ""}
              disabled
              fullWidth
            />
            <TextField
              label="Additional Notes"
              multiline
              rows={3}
              value={formData.additionalNotes}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  additionalNotes: e.target.value,
                }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={20} />
            ) : (
              "Submit"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
