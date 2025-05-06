// pet-adoption-frontend/src/Components/EventsShelter.jsx
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

//updated masterEvents with a new name property for each event
const masterEvents = [
    {
        title: "Themed Adoption Days",
        name: "Themed Adoption Days",
        eventType: "THEMED_ADOPTION_DAYS",
        description: "Events based on popular themes, like 'Star Wars Pets' or 'Superhero Sidekicks', where pets and staff dress accordingly.",
        imageUrl: "https://i.etsystatic.com/25964056/r/il/df7583/4498673153/il_fullxfull.4498673153_c46g.jpg"

    },
    {
        title: "Adoption Day Carnival",
        name: "Adoption Day Carnival",
        eventType: "ADOPTION_DAY_CARNIVAL",
        description: "A fun-filled carnival with pet-themed games, face painting, and food trucks, creating a festive environment to meet and adopt pets.",
        imageUrl: "https://www.sccmo.org/ImageRepository/Document?documentID=8299"

    },
    {
        title: "Pets & Paint Night",
        name: "Pets & Paint Night",
        eventType: "PETS_PAINT_NIGHT",
        description: "An art class where attendees can paint portraits of adoptable pets or create their own pet-themed artwork.",
        imageUrl: "https://paintyourpetsportrait.com/wp-content/uploads/2022/01/Facebook-Banner-single-pets-Small.png"

    },
    {
        title: "Fur-tastic Fashion Show",
        name: "Fur-tastic Fashion Show",
        eventType: "FUR_TASTIC_FASHION_SHOW",
        description: "A runway event featuring adoptable pets dressed in fun costumes, showcasing their personalities and charm.",
        imageUrl: "https://i.etsystatic.com/25964056/r/il/dfb12d/3749125979/il_570xN.3749125979_p33o.jpg"
    },
    {
        title: "Pet Speed Dating",
        name: "Pet Speed Dating",
        eventType: "PET_SPEED_DATING",
        description: "A quick meet-and-greet format where potential adopters can interact with multiple animals to find their ideal match.",
        imageUrl: "https://d17fnq9dkz9hgj.cloudfront.net/uploads/2017/10/PF2015_017_Rue_FrontYard-640.jpg"
    },
    {
        title: "Tailgate Adoption Party",
        name: "Tailgate Adoption Party",
        eventType: "TAILGATE_ADOPTION_PARTY",
        description: "A sports-themed event where pets and potential adopters bond over a tailgate-inspired gathering.",
        imageUrl: "https://mms.businesswire.com/media/20160901006586/en/542449/5/pet_dog_20160726_PetSmart-Scrimmage_0391-min.jpg"

    },
    {
        title: "Storytime with Pets",
        name: "Storytime with Pets",
        eventType: "STORYTIME_WITH_PETS",
        description: "A family-friendly event where kids read books to adoptable animals, fostering a calm and loving environment.",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/59d79627f7e0ab7585717499/1588104563731-R7LE2NDG2B9APQ93UGF5/PHOTO-2020-04-12-17-09-05.jpg"

    },
    {
        title: "Puppy Yoga Class",
        name: "Puppy Yoga Class",
        eventType: "PUPPY_YOGA_CLASS",
        description: "A relaxing yoga session with adorable puppies roaming around. Attendees bond with pets while stretching and unwinding.",
        imageUrl: "https://pethelpers.org/wp-content/uploads/2023/06/white-green-minimalist-Yoga-Class-promotion-Flyer-Facebook-Event-Cover-1.png"
    },
    {
        title: "Movie Night Under the Stars",
        name: "Movie Night Under the Stars",
        eventType: "MOVIE_NIGHT_UNDER_THE_STARS",
        description: "Screening a pet-friendly movie in an outdoor setting, complete with snacks and adoptable animals mingling with attendees.",
        imageUrl: "https://offloadmedia.feverup.com/secretldn.com/wp-content/uploads/2021/04/21045503/doggy-drive-in-film-club-1024x683.png"
    },
    {
        title: "Tricks & Treats Training Workshop",
        name: "Tricks & Treats Training Workshop",
        eventType: "TRICKS_TREATS_TRAINING_WORKSHOP",
        description: "Demonstrations of cute tricks adoptable pets can learn, plus treats and training tips for new pet parents.",
        imageUrl: "https://www.thesprucepets.com/thmb/6eGfO7YKsdRUO-lwV8bPgZhaNjo=/1500x0/filters:no_upscale():strip_icc()/10_fun_and_easy_dog_tricks_11173309_beg_2796-c8293aefe01b456b8aa1290bb1af7423.jpg"

    }
    // ... other events
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

      const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;
      const userData = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
      const user = userData ? JSON.parse(userData) : null;
      const userId = user ? user.id : null;

      const headers = token
          ? {
              headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
            }
          : {};

      if (!userId) {
          setErrorMsg("User ID not found—please log in with a shelter account.");
          return;
      }

      const newEvent = {
          name: selectedEvent.title,
          eventType: selectedEvent.eventType,
          description: selectedEvent.description,
          imageUrl: selectedEvent.imageUrl,
          rating: 10,
          date,
          time,
          location
      };

      try {
          // Get scheduled events for the shelter user only.
          const getUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/shelter/events?userId=${userId}`;
          const { data: scheduled } = await axios.get(getUrl, headers);
          const conflict = scheduled.find(
              (e) =>
                  e.date === newEvent.date &&
                  e.time === newEvent.time &&
                  e.location === newEvent.location
          );
          if (conflict) {
              setErrorMsg("An event is already scheduled at the same date, time, and location.");
              setSuccessMsg("");
              return;
          }
          setErrorMsg("");
      } catch (err) {
          console.error("Error checking scheduled events", err);
          if (err.response?.status === 401) {
              console.log("Unauthorized to check scheduled events.");
          }
      }

      try {
          const postUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/events?userId=${userId}`;
          const response = await axios.post(postUrl, newEvent, headers);
          console.log("Event scheduled successfully", response.data);
          setSuccessMsg("Event scheduled successfully!");
          setErrorMsg("");
          setEvents((prev) => prev.filter((e) => e.title !== selectedEvent.title));
          handleDialogClose();
      } catch (err) {
          console.error("Error scheduling event", err);
          setErrorMsg("Error scheduling event. Please check the console for more details.");
      }
  };

    return (
        <Container>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ fontFamily: "\\'Montserrat\\', sans-serif", fontWeight: "bold", mb: 3 }}
            >
                Available Events
            </Typography>

            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

            <EventList
                events={events}
                onSchedule={handleDialogOpen}
                actionLabel="Schedule Event"
            />

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
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="success"
                        sx={{ borderRadius: "20px", textTransform: "none", ml: 1 }}
                    >
                        Schedule Event
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EventsShelter;