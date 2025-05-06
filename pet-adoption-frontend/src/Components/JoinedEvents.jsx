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
  Box,
  useTheme
} from "@mui/material";
import axios from "axios";

const JoinedEvents = () => {
  const theme = useTheme(); // Use the theme
  
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
    <Box
      sx={{
        background: 'transparent',
        minHeight: "100vh",
        pt: 4,
        pb: 6
      }}
    >
      <Container>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            color: theme.palette.text.primary
          }}
        >
          Your Joined Events
        </Typography>
        
        {successMsg && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
          >
            {successMsg}
          </Alert>
        )}
        
        {errorMsg && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
          >
            {errorMsg}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item key={event.id} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.mode === 'light' 
                    ? 'rgba(0, 0, 0, 0.12)' 
                    : 'rgba(255, 255, 255, 0.12)'}`,
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'light' 
                      ? '0 8px 16px rgba(0, 0, 0, 0.1)' 
                      : '0 8px 16px rgba(0, 0, 0, 0.4)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                {event.imageUrl && (
                  <CardMedia
                    component="img"
                    alt={event.name}
                    image={event.imageUrl}
                    sx={{ 
                      height: 200, 
                      objectFit: "cover",
                      borderBottom: `1px solid ${theme.palette.mode === 'light' 
                        ? 'rgba(0, 0, 0, 0.12)' 
                        : 'rgba(255, 255, 255, 0.12)'}`
                    }}
                  />
                )}
                <CardContent sx={{ 
                  flexGrow: 1,
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary 
                }}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div"
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontWeight: 'bold' 
                    }}
                  >
                    {event.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {event.description}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      mt: 1 
                    }}
                  >
                    {`Date: ${event.date} Time: ${event.time}`}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {`Location: ${event.location}`}
                  </Typography>
                  {event.createdBy && event.createdBy.shelterName && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: "bold",
                        mt: 1,
                      }}
                    >
                      {`Shelter: ${event.createdBy.shelterName}`}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ 
                  padding: 2,
                  backgroundColor: theme.palette.background.paper,
                  borderTop: `1px solid ${theme.palette.mode === 'light' 
                    ? 'rgba(0, 0, 0, 0.08)' 
                    : 'rgba(255, 255, 255, 0.08)'}`
                }}>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => handleCancelAttendance(event.id)}
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    Cancel Attendance
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {events.length === 0 && (
            <Grid item xs={12}>
              <Typography 
                variant="body1" 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: theme.palette.text.secondary
                }}
              >
                You have not joined any events yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default JoinedEvents;