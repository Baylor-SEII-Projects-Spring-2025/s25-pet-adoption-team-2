// pet-adoption-frontend/src/Components/EventList.jsx
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button
} from "@mui/material";

const EventList = ({ events, onSchedule, actionLabel }) => {
  return (
    <Grid container spacing={3}>
      {events.map((event) => (
        <Grid item key={event.id ? event.id : event.title} xs={12} sm={6} md={4}>
          <Card>
            {event.imageUrl && (
              <CardMedia
                component="img"
                alt={event.title}
                image={event.imageUrl}
                sx={{
                  height: 350,
                  objectFit: "cover"
                }}
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
                  sx={{ color: "primary.main", fontWeight: "bold", mt: 1 }}
                >
                  {`Shelter: ${event.createdBy.shelterName}`}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => onSchedule(event)}
              >
                {actionLabel}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default EventList;