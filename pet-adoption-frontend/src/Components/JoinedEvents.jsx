import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Alert,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
} from "@mui/material";
import axios from "axios";

const JoinedEvents = () => {
  const [events, setEvents] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const user = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("user")) : null;
  const userId = user ? user.id : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;

  useEffect(() => {
    if (userId && token) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/adopter/events?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          setEvents(response.data);
          setErrorMsg("");
        })
        .catch((err) => {
          console.error("Error fetching joined events:", err);
          setErrorMsg("Failed to fetch your events.");
        });
    }
  }, [userId, token]);

  const handleCancelAttendance = async (eventId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/events/${eventId}/attendees?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(events.filter((e) => e.id !== eventId));
      setSuccessMsg("Attendance cancelled successfully!");
      setErrorMsg("");
    } catch (err) {
      console.error("Error cancelling attendance:", err);
      setErrorMsg("Could not cancel attendance. Please try again.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Your Joined Events
      </Typography>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid item key={event.id} xs={12} sm={6} md={4}>
            <Card>
              {event.imageUrl && (
                <CardMedia
                  component="img"
                  alt={event.name}
                  image={event.imageUrl}
                  sx={{ height: 350, objectFit: "cover" }}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {event.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Date: ${event.date} Time: ${event.time}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Location: ${event.location}`}
                </Typography>
                {event.createdBy && event.createdBy.shelterName && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "primary.main",
                      fontWeight: "bold",
                      mt: 1,
                    }}
                  >
                    {`Shelter: ${event.createdBy.shelterName}`}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button variant="outlined" color="error" onClick={() => handleCancelAttendance(event.id)}>
                  Cancel Attendance
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default JoinedEvents;