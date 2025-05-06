// pet-adoption-frontend/src/Components/ScheduledEvents.jsx
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
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid
} from "@mui/material";
import axios from "axios";

const ScheduledEvents = () => {
  const [events, setEvents] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  const user = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("user")) : null;
  const userId = user ? user.id : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;

  useEffect(() => {
    if (userId && token) {
      axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080"}/api/shelter/events?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setEvents(response.data);
        setErrorMsg("");
      })
      .catch(err => {
        console.error("Error fetching scheduled events:", err);
        setErrorMsg("Failed to fetch scheduled events.");
      });
    }
  }, [userId, token]);

  const handleDialogOpen = (event) => {
    setSelectedEvent(event);
    setDate(event.date || "");
    setTime(event.time || "");
    setLocation(event.location || "");
    setOpenDialog(true);
    setErrorMsg("");
    setSuccessMsg("");
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
      setErrorMsg("All fields (date, time, location) are required.");
      return;
    }
    const updatedEvent = {
      ...selectedEvent,
      date,
      time,
      location,
    };
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080"}/api/shelter/events/${selectedEvent.id}?userId=${userId}`,
        updatedEvent,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      setEvents(events.map(e => e.id === selectedEvent.id ? response.data : e));
      setSuccessMsg("Event updated successfully!");
      setErrorMsg("");
      handleDialogClose();
    } catch (err) {
      console.error("Error updating event:", err);
      setErrorMsg("Error updating event. Please try again.");
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080"}/api/shelter/events/${eventId}?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(events.filter(e => e.id !== eventId));
      setSuccessMsg("Event deleted successfully!");
      setErrorMsg("");
    } catch (err) {
      console.error("Error deleting event:", err);
      setErrorMsg("Error deleting event. Please try again.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Scheduled Events
      </Typography>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      <Grid container spacing={3}>
        {events.map(event => (
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
              </CardContent>
              <CardActions>
                <Button variant="outlined" onClick={() => handleDialogOpen(event)}>Update</Button>
                <Button variant="outlined" color="error" onClick={() => handleDelete(event.id)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Update Event: {selectedEvent?.name}</DialogTitle>
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
          <Button onClick={handleDialogClose} color="error">Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="success" sx={{ ml: 1 }}>
            Update Event
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScheduledEvents;