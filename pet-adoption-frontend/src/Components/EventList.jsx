// pet-adoption-frontend/src/Components/EventList.jsx
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  useTheme,
  Box
} from "@mui/material";

const EventList = ({ events, onSchedule, actionLabel }) => {
  const theme = useTheme(); 

  return (
    <Grid container spacing={3}>
      {events.map((event) => (
        <Grid item key={event.id ? event.id : event.title} xs={12} sm={6} md={4}>
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
                alt={event.title}
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
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 1
                }}
              >
                {event.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    mb: 0.5
                  }}
                >
                  {`Date: ${event.date} Time: ${event.time}`}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {`Location: ${event.location}`}
                </Typography>
              </Box>
              {event.createdBy && event.createdBy.shelterName && (
                <Typography
                  variant="body2"
                  sx={{ 
                    color: theme.palette.secondary.main,  
                    mt: 2 
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
                color="primary"
                onClick={() => onSchedule(event)}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                {actionLabel}
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
            No events available at this time.
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default EventList;