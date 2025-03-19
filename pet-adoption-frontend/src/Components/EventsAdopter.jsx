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
    try {
      const response = await axios.get("/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching scheduled events", error);
    }
  };

  const addEvent = (event) => {
    console.log("Adopter selected event:", event);
    setSuccessMsg(`Event "${event.name}" added successfully!`);
    // Remove only the selected event using its unique id.
    setEvents(events.filter((e) => e.id !== event.id));
  };

  return (
    <Container>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "bold",
          mb: 3
        }}
      >
        Scheduled Events
      </Typography>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      <EventList events={events} onSchedule={addEvent} actionLabel="Add Event" />
    </Container>
  );
};

export default EventsAdopter;