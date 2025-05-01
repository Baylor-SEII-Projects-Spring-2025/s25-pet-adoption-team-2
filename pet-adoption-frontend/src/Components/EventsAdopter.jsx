import React, { useEffect, useState } from "react";
import { Container, Typography, Alert } from "@mui/material";
import axios from "axios";
import EventList from "./EventList";

const EventsAdopter = () => {
  const [events, setEvents] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchScheduledEvents();
  }, []);

  const fetchScheduledEvents = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await axios.get("/api/events", {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching scheduled events", error);
      if (error.response?.status === 401) {
        console.log("Unauthorized to fetch scheduled events.");
      }
    }
  };

  const addEvent = (event) => {
    console.log("Adopter selected event:", event);
    setSuccessMsg(`Event "${event.name}" added successfully!`);
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
  };

  return (
    <Container>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Scheduled Events
      </Typography>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      <EventList
        events={events}
        onSchedule={addEvent}
        actionLabel="Add Event"
      />
    </Container>
  );
};

export default EventsAdopter;
