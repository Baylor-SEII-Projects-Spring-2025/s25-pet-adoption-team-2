import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import EventList from "../Components/EventList";

const ManageEventsShelter = () => {
  const [events, setEvents] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // For update via dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  // Fetch events from the backend.
  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events", error.response || error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDialogOpen = (event) => {
    setSelectedEvent(event);
    setDate(event.date || "");
    setTime(event.time || "");
    setLocation(event.location || "");
    setErrorMsg("");
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setDate("");
    setTime("");
    setLocation("");
    setErrorMsg("");
  };

  const handleUpdate = async () => {
    if (!date || !time || !location) {
      alert("Date, time, and location are required for update.");
      return;
    }
    if (!selectedEvent || !selectedEvent.id) {
      console.error("Selected event does not have a valid id:", selectedEvent);
      setErrorMsg("Invalid event data. Please refresh and try again.");
      return;
    }

    // Construct the updated event data by merging required existing properties.
    const updatedEventData = {
      name: selectedEvent.name || selectedEvent.title,
      imageUrl: selectedEvent.imageUrl,
      description: selectedEvent.description,
      rating: selectedEvent.rating || 10,
      date,
      time,
      location,
      eventType: selectedEvent.eventType || "DEFAULT_TYPE", // include the eventType
    };

    try {
    const eventId = selectedEvent.id;
    const response = await axios.put(
      `/api/events/${eventId}`,
      updatedEventData
    );
      console.log("Event updated", response.data);
      setSuccessMsg("Event updated successfully!");
      setEvents(
        events.map((e) =>
          e.id === selectedEvent.id ? { ...e, ...updatedEventData } : e
        )
      );
      handleDialogClose();
    } catch (error) {
      console.error("Error updating event", error.response || error);
      setErrorMsg("Failed to update event.");
    }
  };

  const handleDelete = async (event) => {
    if (!event || !event.id) {
      console.error("Event does not have a valid id:", event);
      setErrorMsg("Invalid event data. Please refresh and try again.");
      return;
    }
    try {
      await axios.delete(`/api/events/${event.id}`);
      setSuccessMsg("Event deleted successfully!");
      setEvents(events.filter((e) => e.id !== event.id));
    } catch (error) {
      console.error("Error deleting event", error.response || error);
      setErrorMsg("Failed to delete event.");
    }
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
        Manage My Events
      </Typography>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      <EventList events={events} onUpdate={handleDialogOpen} onDelete={handleDelete} />

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Update Event: {selectedEvent?.name || selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Event Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Event Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Event Location"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            color="error"
            sx={{ borderRadius: "20px", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            color="info"
            sx={{ borderRadius: "20px", textTransform: "none", ml: 1 }}
          >
            Update Event
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageEventsShelter;