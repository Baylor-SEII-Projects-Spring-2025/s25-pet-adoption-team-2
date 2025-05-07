// File: java/petadoption/api/controller/ShelterEventController.java
package petadoption.api.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import petadoption.api.events.Events;
import petadoption.api.service.EventService;
import petadoption.api.user.UserRepository;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;

import java.util.ArrayList;
import java.util.List;

import java.io.File;
import java.util.List;
import petadoption.api.repository.EventRepository;
import petadoption.api.user.UserRepository;

@RestController
@RequestMapping("/api/shelter/events")
@CrossOrigin(origins = "http://35.225.196.242:3000")
public class ShelterEventController {

    private static final Logger logger = LoggerFactory.getLogger(ShelterEventController.class);

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

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
        System.out.println("GET /api/shelter/events requested for userId: " + userId);

        try {
            // Use the new safer method
            List<Events> events = eventService.getSafeEventsForShelter(userId);
            System.out.println("Successfully found " + events.size() + " events for shelter: " + userId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            // Log the error to file
            try {
                FileWriter fw = new FileWriter("app-error.log", true);
                fw.write(new Date().toString() + ": ERROR in ShelterEventController: " + e.getMessage() + "\n");
                // Add stack trace for more detail
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                fw.write(sw.toString() + "\n");
                fw.close();
            } catch (IOException logError) {
                System.out.println("Cannot write to log file");
            }

            System.out.println("Error in shelter events controller: " + e.getMessage());
            // Return empty list on error to avoid 500 status
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Add this to your ShelterEventController.java
    // Add this to your ShelterEventController.java
    @GetMapping("/debug")
    public ResponseEntity<String> getDebugInfo() {
        StringBuilder debug = new StringBuilder();
        debug.append("Debug Information:\n");

        try {
            // Check if user 10 exists
            boolean userExists = userRepository.existsById(10L);
            debug.append("User ID 10 exists: ").append(userExists).append("\n");

            // Count total events using the repository, not the service
            long eventCount = eventRepository.count();
            debug.append("Total events in database: ").append(eventCount).append("\n");

            // Try to list events for user 10 safely
            try {
                List<Events> events = eventService.getSafeEventsForShelter(10L);
                debug.append("Events found for user 10: ").append(events.size()).append("\n");

                // Show some details about the first few events
                int count = 0;
                for (Events event : events) {
                    if (count++ >= 3) break; // Only show up to 3 events
                    debug.append("Event ID: ").append(event.getId())
                            .append(", Name: ").append(event.getName())
                            .append(", CreatedBy: ").append(event.getCreatedBy() != null ?
                                    event.getCreatedBy().getId() : "null")
                            .append("\n");
                }
            } catch (Exception e) {
                debug.append("Error getting events: ").append(e.getMessage()).append("\n");
            }

            // Check app-error.log existence
            File logFile = new File("app-error.log");
            debug.append("Log file exists: ").append(logFile.exists()).append("\n");
            debug.append("Log file path: ").append(logFile.getAbsolutePath()).append("\n");

            return ResponseEntity.ok(debug.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("Error generating debug info: " + e.getMessage());
        }
    }
}