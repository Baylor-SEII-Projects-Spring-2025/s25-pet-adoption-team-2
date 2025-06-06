// pet-adoption-frontend/src/Components/EventsAdopter.jsx
import React, { useEffect, useState } from "react";
import { 
  Container, 
  Typography, 
  Alert, 
  Box,
  useTheme
} from "@mui/material";
import axios from "axios";
import EventList from "./EventList";
import { useColorMode } from "../utils/theme"; 

const EventsAdopter = () => {
  const theme = useTheme(); 
  const colorMode = useColorMode(); 
  
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchScheduledEvents();
    fetchJoinedEvents();
  }, []);

  const fetchScheduledEvents = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080"}/api/events`;
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching scheduled events", error);
      if (error.response?.status === 401) {
        console.log("Unauthorized to fetch scheduled events.");
      }
    }
  };

  const fetchJoinedEvents = async () => {
    const token = localStorage.getItem("jwtToken");
    const userData = sessionStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    if (!user?.id) {
      console.error("No user ID for fetching joined events");
      return;
    }
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080"}/api/adopter/events?userId=${user.id}`;
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setJoinedEvents(response.data);
    } catch (error) {
      console.error("Error fetching joined events", error);
    }
  };

  const addEvent = async (event) => {
    setSuccessMsg("");
    setErrorMsg("");

    if (joinedEvents.some(e => e.id === event.id)) {
      setErrorMsg(`You have already signed up for event "${event.name}".`);
      return;
    }

    const token = localStorage.getItem("jwtToken");
    const userData = sessionStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    if (!user?.id) {
      console.error("No user ID");
      return;
    }
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080"}/api/events/${event.id}/attendees?userId=${user.id}`;
      await axios.post(url, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccessMsg(`You have successfully joined event "${event.name}"!`);
      setJoinedEvents(prev => [...prev, event]);
      setEvents(prev => prev.filter(e => e.id !== event.id));
    } catch (error) {
      console.error("Error adding attendee", error);
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
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          gutterBottom
          sx={{ 
            mb: 3,
            color: theme.palette.text.primary
          }}
        >
          Available Events
        </Typography>

        {successMsg && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2, 
              backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(237, 247, 237, 0.9)' 
                : 'rgba(30, 70, 32, 0.9)',
              color: theme.palette.mode === 'light' ? '#1b5e20' : '#a5d6a7'
            }}
          >
            {successMsg}
          </Alert>
        )}

        {errorMsg && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(253, 237, 237, 0.9)' 
                : 'rgba(97, 26, 21, 0.9)',
              color: theme.palette.mode === 'light' ? '#c62828' : '#ef9a9a'
            }}
          >
            {errorMsg}
          </Alert>
        )}

        <Box 
          sx={{ 
            backgroundColor: theme.palette.background.paper, 
            borderRadius: theme.shape.borderRadius,
            boxShadow: 2,
            p: 3,
            transition: 'all 0.3s ease'
          }}
        >
          <EventList 
            events={events} 
            onSchedule={addEvent} 
            actionLabel="Add Event"
            colorMode={colorMode} 
          />
        </Box>
      </Container>
    </Box>
  );
};

export default EventsAdopter;