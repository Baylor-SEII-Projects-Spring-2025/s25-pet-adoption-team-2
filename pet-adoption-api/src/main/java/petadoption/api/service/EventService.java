package petadoption.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import petadoption.api.events.Events;
import petadoption.api.repository.EventRepository;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;

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

        // Check if user exists
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            logger.info("User found with ID: {}", userId);
            // If your User class has other fields you can access, you can log them here
            // e.g., logger.info("User found: {} ({})", user.get().getEmail(), user.get().getId());
        } else {
            logger.warn("User ID {} not found in database", userId);
        }

        List<Events> allEvents = eventRepository.findAll();
        logger.info("Total events in database: {}", allEvents.size());

        List<Events> userEvents = allEvents.stream()
                .filter(e -> {
                    boolean hasCreator = e.getCreatedBy() != null;
                    boolean createdByUser = hasCreator && e.getCreatedBy().getId().equals(userId);
                    if (hasCreator) {
                        logger.debug("Event ID {}: Created by user {}? {}",
                                e.getId(), e.getCreatedBy().getId(), createdByUser);
                    }
                    return hasCreator && createdByUser;
                })
                .collect(Collectors.toList());

        logger.info("Found {} events created by user {}", userEvents.size(), userId);
        return userEvents;
    }

    public List<Events> getEventsForAdopter(Long userId) {
        return eventRepository.findAll().stream()
                .filter(e -> e.getAttendees() != null &&
                        e.getAttendees().stream().anyMatch(u -> u.getId().equals(userId)))
                .collect(Collectors.toList());
    }
}