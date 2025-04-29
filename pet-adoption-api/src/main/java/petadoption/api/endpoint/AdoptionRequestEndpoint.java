package petadoption.api.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import petadoption.api.notifications.NotificationsService;
import petadoption.api.user.User;
import petadoption.api.user.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/adoption-requests")
@CrossOrigin(origins = "http://localhost:3000")
public class AdoptionRequestEndpoint {

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationsService notificationsService;

    @PostMapping
    public ResponseEntity<?> createAdoptionRequest(@RequestBody Map<String, Object> request) {
        try {
            // Parse request parameters with proper error handling
            Long userId = null;
            Long petId = null;
            Long adoptionCenterId = null;
            String additionalNotes = "";

            try {
                if (request.get("userId") != null) {
                    userId = Long.parseLong(request.get("userId").toString());
                } else {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "userId is required"
                    ));
                }

                if (request.get("petId") != null) {
                    petId = Long.parseLong(request.get("petId").toString());
                } else {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "petId is required"
                    ));
                }

                if (request.get("adoptionCenterId") != null) {
                    adoptionCenterId = Long.parseLong(request.get("adoptionCenterId").toString());
                } else if (request.get("shelterId") != null) {
                    adoptionCenterId = Long.parseLong(request.get("shelterId").toString());
                } else {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "adoptionCenterId or shelterId is required"
                    ));
                }

                if (request.get("additionalNotes") != null) {
                    additionalNotes = request.get("additionalNotes").toString();
                } else if (request.get("notes") != null) {
                    additionalNotes = request.get("notes").toString();
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid ID format: " + e.getMessage()
                ));
            }

            // Find the user
            User user = userService.findUser(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Determine user name
            String userName = "Unknown User";
            if (user.getFirstName() != null && user.getLastName() != null) {
                userName = user.getFirstName() + " " + user.getLastName();
            } else if (user.getFirstName() != null) {
                userName = user.getFirstName();
            } else if (user.getEmailAddress() != null) {
                userName = user.getEmailAddress();
            }

            // Build notification text
            String notificationText = String.format(
                    "New adoption request from %s (ID: %d) for pet ID %d.%s",
                    userName,
                    userId,
                    petId,
                    additionalNotes != null && !additionalNotes.isEmpty() ?
                            "\nNotes: " + additionalNotes : ""
            );

            // Send notification to the specific shelter
            notificationsService.createNotificationForShelter(notificationText, adoptionCenterId);

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Adoption request submitted successfully");
            response.put("userId", userId);
            response.put("petId", petId);
            response.put("adoptionCenterId", adoptionCenterId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log detailed error for server-side debugging
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to submit adoption request: " + e.getMessage()
            ));
        }
    }
}