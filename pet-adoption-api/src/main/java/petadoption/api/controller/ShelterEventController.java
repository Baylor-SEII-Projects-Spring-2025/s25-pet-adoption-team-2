// File: java/petadoption/api/controller/ShelterEventController.java
package petadoption.api.controller;

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
        List<Events> events = eventService.getEventsForShelter(userId);
        return ResponseEntity.ok(events);
    }
}