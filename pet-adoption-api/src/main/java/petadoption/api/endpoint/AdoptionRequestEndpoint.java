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
@CrossOrigin(origins = "http://localhost:3001")
public class AdoptionRequestEndpoint {

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationsService notificationsService;

    @PostMapping
    public ResponseEntity<?> createAdoptionRequest(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            Long petId = Long.parseLong(request.get("petId").toString());
            Long adoptionCenterId = Long.parseLong(request.get("adoptionCenterId").toString());
            String additionalNotes = request.get("additionalNotes").toString();

            User user = userService.findUser(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String userName = "Unknown User";
            if (user.getFirstName() != null && user.getLastName() != null) {
                userName = user.getFirstName() + " " + user.getLastName();
            } else if (user.getFirstName() != null) {
                userName = user.getFirstName();
            } else if (user.getEmailAddress() != null) {
                userName = user.getEmailAddress();
            }

            String notificationText = String.format(
                "New adoption request from %s (ID: %d) for pet ID %d.%s",
                userName,
                userId,
                petId,
                additionalNotes != null && !additionalNotes.isEmpty() ? 
                    "\nNotes: " + additionalNotes : ""
            );

            notificationsService.createNotificationForAdoptionCenter(notificationText);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Adoption request submitted successfully");
            response.put("userId", userId);
            response.put("petId", petId);
            response.put("adoptionCenterId", adoptionCenterId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to submit adoption request: " + e.getMessage()
            ));
        }
    }
} 