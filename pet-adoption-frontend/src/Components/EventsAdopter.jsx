// pet-adoption-frontend/src/Components/EventsAdopter.jsx
import React, { useEffect, useState } from "react";
import { Container, Typography, Alert } from "@mui/material";
import axios from "axios";
import EventList from "./EventList";

const EventsAdopter = () => {
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
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/events`;
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
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/adopter/events?userId=${user.id}`;
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setJoinedEvents(response.data);
    } catch (error) {
      console.error("Error fetching joined events", error);
    }
  };

  const addEvent = async (event) => {
    // clear any previous messages
    setSuccessMsg("");
    setErrorMsg("");

    // Check if user already joined the event
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
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/events/${event.id}/attendees?userId=${user.id}`;
      await axios.post(url, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccessMsg(`You have successfully joined event "${event.name}"!`);
      // Optionally update the joined events list
      setJoinedEvents(prev => [...prev, event]);
      // Remove event from available events after joining
      setEvents(prev => prev.filter(e => e.id !== event.id));
    } catch (error) {
      console.error("Error adding attendee", error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "\\'Montserrat\\', sans-serif", fontWeight: "bold", mb: 3 }}
      >
        Available Events
      </Typography>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <EventList events={events} onSchedule={addEvent} actionLabel="Add Event" />
    </Container>
  );
};

export default EventsAdopter;