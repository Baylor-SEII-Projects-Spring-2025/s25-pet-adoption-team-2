// File: java/petadoption/api/controller/ShelterEventController.java
package petadoption.api.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import petadoption.api.events.Events;
import petadoption.api.service.EventService;

import java.util.List;

@RestController
@RequestMapping("/api/shelter/events")
@CrossOrigin(origins = "http://35.225.196.242:3000")
public class ShelterEventController {

    private static final Logger logger = LoggerFactory.getLogger(ShelterEventController.class);

    @Autowired
    private EventService eventService;

    @PutMapping("/{id}")
    public ResponseEntity<Events> updateEventForShelter(@PathVariable Long id, @RequestBody Events eventDetails, @RequestParam Long userId) {
        Events updatedEvent = eventService.updateEventForShelter(id, eventDetails, userId);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventForShelter(@PathVariable Long id, @RequestParam Long userId) {
        eventService.deleteEventForShelter(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Events>> getEventsForShelter(@RequestParam Long userId) {
        logger.info("GET /api/shelter/events called with userId: {}", userId);
        try {
            List<Events> events = eventService.getEventsForShelter(userId);
            logger.info("Successfully retrieved {} events for shelter user: {}", events.size(), userId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            logger.error("Error retrieving events for shelter user: {}", userId, e);
            return ResponseEntity.status(500).body(null);
        }
    }
}