import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  CardActions
} from "@mui/material";

const EventList = ({ events, onSchedule, onUpdate, onDelete, actionLabel = "Schedule Event" }) => {
  return (
    <Grid container spacing={4}>
      {events.map((event) => (
        <Grid item xs={12} sm={6} md={4} key={event.id || event.title}>
          <Card sx={{ display: "flex", flexDirection: "column", height: "600px" }}>
            <CardMedia
              component="img"
              sx={{ height: 350, objectFit: "cover" }}
              image={event.imageUrl}
              alt={event.name || event.title}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div">
                {event.name || event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.description}
              </Typography>
              {event.location && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Location: {event.location}
                </Typography>
              )}
              {(event.date || event.time) && (
                <Typography variant="body2" color="text.secondary">
                  {event.date && `Date: ${event.date}`} {event.time && `Time: ${event.time}`}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              {onSchedule && (
                <Button
                  size="small"
                  onClick={() => onSchedule(event)}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" }
                  }}
                >
                  {actionLabel}
                </Button>
              )}
              {onUpdate && (
                <Button
                  size="small"
                  onClick={() => onUpdate(event)}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    backgroundColor: "info.main",
                    color: "white",
                    "&:hover": { backgroundColor: "info.dark" }
                  }}
                >
                  Update
                </Button>
              )}
              {onDelete && (
                <Button
                  size="small"
                  onClick={() => onDelete(event)}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    backgroundColor: "error.main",
                    color: "white",
                    "&:hover": { backgroundColor: "error.dark" }
                  }}
                >
                  Delete
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default EventList;