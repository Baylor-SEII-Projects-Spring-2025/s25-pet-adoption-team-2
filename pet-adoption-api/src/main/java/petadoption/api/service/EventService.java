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

    public List<Events> getSafeEventsForShelter(Long userId) {
        System.out.println("Safely fetching events for shelter ID: " + userId);

        if (userId == null) {
            System.out.println("Null userId provided");
            return new ArrayList<>();
        }

        try {
            // First check if the user exists
            boolean userExists = userRepository.existsById(userId);
            if (!userExists) {
                System.out.println("User ID " + userId + " does not exist");
                return new ArrayList<>();
            }

            // Approach 1: Try direct query method first
            try {
                List<Events> userEvents = eventRepository.findByCreatedById(userId);
                System.out.println("Found " + userEvents.size() + " events for user " + userId + " using direct query");
                return userEvents;
            } catch (Exception e) {
                System.out.println("Direct query failed, falling back: " + e.getMessage());
            }

            // Approach 2: Try getting the user and then finding their events
            try {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    List<Events> userEvents = eventRepository.findByCreatedBy(user);
                    System.out.println("Found " + userEvents.size() + " events for user " + userId + " using user object");
                    return userEvents;
                }
            } catch (Exception e) {
                System.out.println("User-based query failed, falling back: " + e.getMessage());
            }

            // Approach 3: Manual filtering as last resort
            List<Events> allEvents = eventRepository.findAll();
            System.out.println("Total events in database: " + allEvents.size());

            List<Events> userEvents = new ArrayList<>();
            for (Events event : allEvents) {
                try {
                    if (event != null && event.getCreatedBy() != null &&
                            userId.equals(event.getCreatedBy().getId())) {
                        userEvents.add(event);
                    }
                } catch (Exception e) {
                    System.out.println("Error processing event: " + e.getMessage());
                }
            }

            System.out.println("Found " + userEvents.size() + " events for user " + userId + " after manual filtering");
            return userEvents;
        } catch (Exception e) {
            System.out.println("Database error in getSafeEventsForShelter: " + e.getMessage());
            // Always return empty list instead of throwing exception
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