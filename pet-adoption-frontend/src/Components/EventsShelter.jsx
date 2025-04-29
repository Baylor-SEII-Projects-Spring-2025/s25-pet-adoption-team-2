import React, { useState } from "react";
import {
  Container,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import axios from "axios";
import EventList from "./EventList";

// This master list is used for available events.
// Replace "your-image-url-here" with your actual image URLs.
const masterEvents = [
  {
    title: "Themed Adoption Days",
    description:
      "Events based on popular themes, like 'Star Wars Pets' or 'Superhero Sidekicks,' where pets and staff dress accordingly.",
    imageUrl: "https://i.etsystatic.com/25964056/r/il/df7583/4498673153/il_fullxfull.4498673153_c46g.jpg"
  },
  {
    title: "Adoption Day Carnival",
    description:
      "A fun-filled carnival with pet-themed games, face painting, and food trucks, creating a festive environment to meet and adopt pets.",
    imageUrl:
      "https://www.sccmo.org/ImageRepository/Document?documentID=8299"
  },
  {
    title: "Pets & Paint Night",
    description:
      "An art class where attendees can paint portraits of adoptable pets or create their own pet-themed artwork.",
    imageUrl: "https://paintyourpetsportrait.com/wp-content/uploads/2022/01/Facebook-Banner-single-pets-Small.png"
  },
  {
    title: "Fur-tastic Fashion Show",
    description:
      "A runway event featuring adoptable pets dressed in fun costumes, showcasing their personalities and charm.",
    imageUrl: "https://i.etsystatic.com/25964056/r/il/dfb12d/3749125979/il_570xN.3749125979_p33o.jpg"
  },
  {
    title: "Pet Speed Dating",
    description:
      "A quick meet-and-greet format where potential adopters can interact with multiple animals to find their ideal match.",
    imageUrl: "https://d17fnq9dkz9hgj.cloudfront.net/uploads/2017/10/PF2015_017_Rue_FrontYard-640.jpg"
  },
  {
    title: "Tailgate Adoption Party",
    description:
      "A sports-themed event where pets and potential adopters bond over a tailgate-inspired gathering.",
    imageUrl: "https://mms.businesswire.com/media/20160901006586/en/542449/5/pet_dog_20160726_PetSmart-Scrimmage_0391-min.jpg"
  },
  {
    title: "Storytime with Pets",
    description:
      "A family-friendly event where kids read books to adoptable animals, fostering a calm and loving environment.",
    imageUrl: "https://images.squarespace-cdn.com/content/v1/59d79627f7e0ab7585717499/1588104563731-R7LE2NDG2B9APQ93UGF5/PHOTO-2020-04-12-17-09-05.jpg"
  },
  {
    title: "Puppy Yoga Class",
    description:
      "A relaxing yoga session with adorable puppies roaming around. Attendees bond with pets while stretching and unwinding.",
    imageUrl:
      "https://pethelpers.org/wp-content/uploads/2023/06/white-green-minimalist-Yoga-Class-promotion-Flyer-Facebook-Event-Cover-1.png"
  },
  {
    title: "Movie Night Under the Stars",
    description:
      "Screening a pet-friendly movie in an outdoor setting, complete with snacks and adoptable animals mingling with attendees.",
    imageUrl: "https://offloadmedia.feverup.com/secretldn.com/wp-content/uploads/2021/04/21045503/doggy-drive-in-film-club-1024x683.png"
  },
  {
    title: "Tricks & Treats Training Workshop",
    description:
      "Demonstrations of cute tricks adoptable pets can learn, plus treats and training tips for new pet parents.",
    imageUrl: "https://www.thesprucepets.com/thmb/6eGfO7YKsdRUO-lwV8bPgZhaNjo=/1500x0/filters:no_upscale():strip_icc()/10_fun_and_easy_dog_tricks_11173309_beg_2796-c8293aefe01b456b8aa1290bb1af7423.jpg"
  }
  // ...other events...
];

const EventsShelter = () => {
  const [events, setEvents] = useState(masterEvents);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  const handleDialogOpen = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
    setErrorMsg("");
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setDate("");
    setTime("");
    setLocation("");
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    if (!date || !time || !location) {
      alert("All fields (date, time, location) are required.");
      return;
    }
    const newEvent = {
      name: selectedEvent.title,
      imageUrl: selectedEvent.imageUrl,
      description: selectedEvent.description,
      rating: 10,
      date,
      time,
      location
    };

    const token = localStorage.getItem('jwtToken');

    try {
      // Check for conflicts in scheduled events
      const getResponse = await axios.get("/api/events", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const scheduledEvents = getResponse.data;
      const conflict = scheduledEvents.find(
        (e) =>
          e.date === newEvent.date &&
          e.time === newEvent.time &&
          e.location === newEvent.location
      );
      if (conflict) {
        setErrorMsg("An event is already scheduled at the same date, time, and location.");
        setSuccessMsg("");
        return;
      } else {
        setErrorMsg("");
      }
    } catch (err) {
      console.error("Error checking scheduled events", err);
      if (err.response && err.response.status === 401) {
        console.log("Unauthorized to check scheduled events.");
      }
    }

    try {
      const response = await axios.post("/api/events", newEvent, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log("Event scheduled", response.data);
      setSuccessMsg("Event scheduled successfully!");
      setErrorMsg("");
      setEvents(events.filter((e) => e.title !== selectedEvent.title));
      handleDialogClose();
    } catch (error) {
      console.error("Error scheduling event", error);
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized to schedule event.");
      }
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
          mb: 3
        }}
      >
        Available Events
      </Typography>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      <EventList events={events} onSchedule={handleDialogOpen} actionLabel="Schedule Event" />

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Schedule Event: {selectedEvent?.title}</DialogTitle>
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
          <Button onClick={handleDialogClose} color="error" sx={{ borderRadius: "20px", textTransform: "none" }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="success" sx={{ borderRadius: "20px", textTransform: "none", ml: 1 }}>
            Schedule Event
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventsShelter;