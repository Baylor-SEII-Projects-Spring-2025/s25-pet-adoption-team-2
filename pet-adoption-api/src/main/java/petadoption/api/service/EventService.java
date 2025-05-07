package petadoption.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import petadoption.api.events.Events;
import petadoption.api.repository.EventRepository;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public Events createEvent(Events event, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        event.setCreatedBy(user);
        return eventRepository.save(event);
    }

    public Optional<Events> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public List<Events> getAllEvents() {
        return eventRepository.findAll();
    }

    public Events updateEvent(Long id, Events eventDetails) {
        Events event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setName(eventDetails.getName());
        event.setDescription(eventDetails.getDescription());
        event.setImageUrl(eventDetails.getImageUrl());
        event.setRating(eventDetails.getRating());
        event.setLocation(eventDetails.getLocation());
        event.setDate(eventDetails.getDate());
        event.setTime(eventDetails.getTime());
        event.setEventType(eventDetails.getEventType());
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        Events event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        eventRepository.delete(event);
    }

    public void deleteAllEvents() {
        eventRepository.deleteAll();
    }

    public Events addAttendee(Long eventId, Long userId) {
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!event.getAttendees().contains(user)) {
            event.getAttendees().add(user);
        }
        return eventRepository.save(event);
    }

    public Events removeAttendee(Long eventId, Long userId) {
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        event.getAttendees().remove(user);
        return eventRepository.save(event);
    }

    public Events updateEventForShelter(Long id, Events eventDetails, Long userId) {
        Events event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!event.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this event");
        }
        event.setName(eventDetails.getName());
        event.setDescription(eventDetails.getDescription());
        event.setImageUrl(eventDetails.getImageUrl());
        event.setRating(eventDetails.getRating());
        event.setLocation(eventDetails.getLocation());
        event.setDate(eventDetails.getDate());
        event.setTime(eventDetails.getTime());
        event.setEventType(eventDetails.getEventType());
        return eventRepository.save(event);
    }

    public void deleteEventForShelter(Long id, Long userId) {
        Events event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!event.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this event");
        }
        eventRepository.delete(event);
    }

    public List<Events> getEventsForShelter(Long userId) {
        logger.info("Fetching events for shelter user ID: {}", userId);

        try {
            // Check if user exists first
            boolean userExists = userRepository.existsById(userId);
            if (!userExists) {
                logger.warn("User ID {} not found in database", userId);
                return new ArrayList<>(); // Return empty list
            }

            List<Events> allEvents = eventRepository.findAll();
            logger.info("Total events in database: {}", allEvents.size());

            List<Events> userEvents = allEvents.stream()
                    .filter(e -> {
                        if (e.getCreatedBy() == null) {
                            return false;
                        }
                        return e.getCreatedBy().getId().equals(userId);
                    })
                    .collect(Collectors.toList());

            logger.info("Found {} events created by user {}", userEvents.size(), userId);
            return userEvents;
        } catch (Exception e) {
            logger.error("Error in getEventsForShelter: ", e);
            throw e; // Re-throw to be caught by controller
        }
    }

    // Add this method to your EventService class
    public List<Events> getSafeEventsForShelter(Long userId) {
        System.out.println("Safely fetching events for shelter ID: " + userId);

        // Log the start of the method call
        try {
            FileWriter fw = new FileWriter("app-error.log", true);
            fw.write(new Date().toString() + ": getSafeEventsForShelter called for userId: " + userId + "\n");
            fw.close();
        } catch (IOException logError) {
            System.out.println("Cannot write to log file");
        }

        // Return empty list if userId is invalid
        if (userId == null) {
            System.out.println("Null userId provided");
            return new ArrayList<>();
        }

        try {
            // Try to get all events first
            List<Events> allEvents = eventRepository.findAll();
            System.out.println("Total events in database: " + allEvents.size());

            // Use a more defensive approach to filter events
            List<Events> userEvents = allEvents.stream()
                    .filter(event -> {
                        // Skip null events
                        if (event == null) return false;

                        try {
                            // Check if createdBy exists and matches userId
                            return event.getCreatedBy() != null &&
                                    event.getCreatedBy().getId() != null &&
                                    event.getCreatedBy().getId().equals(userId);
                        } catch (Exception e) {
                            // Log filter exceptions
                            try {
                                FileWriter fw = new FileWriter("app-error.log", true);
                                fw.write(new Date().toString() + ": Error processing event: " + e.getMessage() + "\n");
                                fw.close();
                            } catch (IOException logError) {
                                System.out.println("Cannot write to log file");
                            }

                            System.out.println("Error processing event: " + e.getMessage());
                            return false; // Skip problematic events
                        }
                    })
                    .collect(Collectors.toList());

            // Log success
            try {
                FileWriter fw = new FileWriter("app-error.log", true);
                fw.write(new Date().toString() + ": Found " + userEvents.size() + " events for userId: " + userId + "\n");
                fw.close();
            } catch (IOException logError) {
                System.out.println("Cannot write to log file");
            }

            return userEvents;
        } catch (Exception e) {
            // Log the main exception
            try {
                FileWriter fw = new FileWriter("app-error.log", true);
                fw.write(new Date().toString() + ": ERROR in getSafeEventsForShelter: " + e.getMessage() + "\n");
                // Add stack trace for more detail
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                fw.write(sw.toString() + "\n");
                fw.close();
            } catch (IOException logError) {
                System.out.println("Cannot write to log file");
            }

            System.out.println("Database error in getSafeEventsForShelter: " + e.getMessage());
            // Return empty list rather than throwing an exception
            return new ArrayList<>();
        }
    }

    public List<Events> getEventsForAdopter(Long userId) {
        return eventRepository.findAll().stream()
                .filter(e -> e.getAttendees() != null &&
                        e.getAttendees().stream().anyMatch(u -> u.getId().equals(userId)))
                .collect(Collectors.toList());
    }
}