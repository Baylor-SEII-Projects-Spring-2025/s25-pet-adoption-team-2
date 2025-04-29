package petadoption.api.notifications;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import petadoption.api.pet.Pet;
import petadoption.api.pet.PetRepository;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationsController {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    private final NotificationsService notificationsService;

    public NotificationsController(NotificationsService notificationsService) {
        this.notificationsService = notificationsService;
    }

    @GetMapping
    public List<Notifications> getAllNotifications() {
        return notificationsService.getAllNotifications();
    }

    @GetMapping("/unread")
    public List<Notifications> getUnreadNotifications() {
        return notificationsService.getUnreadNotifications();
    }

    @GetMapping("/user/{userId}")
    public List<Notifications> getNotificationsByUser(@PathVariable Long userId) {
        System.out.println("Fetching notifications for user ID: " + userId);

        // Use the service layer rather than trying to access the repository directly
        List<Notifications> notifications = notificationsService.getUnreadNotificationsByUserId(userId);

        // Log how many we found
        System.out.println("Found " + notifications.size() + " unread notifications for user " + userId);

        // Sort by creation date (newest first)
        notifications.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return notifications;
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody NotificationsRequest request) {
        try {
            // Validate that required fields are present
            if (request.getPetId() == null) {
                return ResponseEntity.badRequest().body("petId is required");
            }

            if (request.getUserId() == null) {
                return ResponseEntity.badRequest().body("userId is required");
            }

            if (request.getDisplayName() == null || request.getDisplayName().isEmpty()) {
                return ResponseEntity.badRequest().body("displayName is required");
            }

            // 1) Load the pet and its shelter
            Pet pet = petRepository.findById(request.getPetId())
                    .orElseThrow(() -> new RuntimeException("Pet not found: " + request.getPetId()));

            Long shelterId = pet.getAdoptionCenterId();
            if (shelterId == null) {
                return ResponseEntity.badRequest().body("Pet does not have an associated shelter");
            }

            // 2) Build your notification text
            String notificationText = String.format(
                    "New adoption request from %s (ID: %d) for pet '%s' (ID: %d)",
                    request.getDisplayName(),
                    request.getUserId(),
                    pet.getName(),
                    request.getPetId()
            );

            // 3) Send only to that one shelter
            Notifications notification = notificationsService.createNotificationForShelter(notificationText, shelterId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating notification: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        try {
            Notifications notification = notificationsService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error marking notification as read: " + e.getMessage());
        }
    }

    @PostMapping("/reply")
    public Notifications replyToNotification(@RequestBody NotificationsReplyRequest request) {
        return notificationsService.replyToNotification(request.getNotificationId(), request.getReply());
    }

    @PostMapping("/approve-adoption")
    public ResponseEntity<?> approveAdoption(@RequestBody Map<String, Object> request) {
        try {
            // Extract parameters
            Long notificationId = Long.parseLong(request.get("notificationId").toString());
            Long petId = Long.parseLong(request.get("petId").toString());
            Long adopterId = Long.parseLong(request.get("adopterId").toString());
            Long shelterId = Long.parseLong(request.get("shelterId").toString());
            String message = request.get("message") != null ? request.get("message").toString() : "";

            // Load the pet
            Pet pet = petRepository.findById(petId)
                    .orElseThrow(() -> new RuntimeException("Pet not found: " + petId));

            // Verify the shelter is the owner of the pet
            if (!pet.getAdoptionCenterId().equals(shelterId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You are not authorized to approve adoption for this pet");
            }

            // Mark original notification as read
            notificationsService.markAsRead(notificationId);

            // Create adoption approval notification for the adopter
            String approvalText = String.format(
                    "Adoption approval: Your request to adopt %s (ID: %d) has been approved! %s",
                    pet.getName(),
                    pet.getId(),
                    message.isEmpty() ? "" : "\n\nMessage from shelter: " + message
            );

            Notifications approvalNotification = notificationsService.createNotificationForUser(
                    approvalText, adopterId);

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notification", approvalNotification);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error approving adoption: " + e.getMessage());
        }
    }

    @PostMapping("/adopter-response")
    public ResponseEntity<?> handleAdopterResponse(@RequestBody Map<String, Object> request) {
        try {
            // Extract parameters
            Long notificationId = Long.parseLong(request.get("notificationId").toString());
            boolean accepted = Boolean.parseBoolean(request.get("accepted").toString());

            // Get the original notification
            Notifications notification = notificationsService.getNotification(notificationId);
            if (notification == null) {
                return ResponseEntity.badRequest().body("Notification not found");
            }

            // Mark as read
            notificationsService.markAsRead(notificationId);

            // Extract pet details from notification text
            String notificationText = notification.getText();
            String petName = "the pet";
            Long petId = null;

            // Try to extract pet name and ID
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("adopt (.*?) \\(ID: (\\d+)\\)");
            java.util.regex.Matcher matcher = pattern.matcher(notificationText);
            if (matcher.find()) {
                petName = matcher.group(1);
                petId = Long.parseLong(matcher.group(2));
            }

            // Get user and pet adoption center
            User adopter = notification.getUser();
            Long shelterId = null;

            if (petId != null) {
                Pet pet = petRepository.findById(petId)
                        .orElse(null);
                if (pet != null) {
                    shelterId = pet.getAdoptionCenterId();

                    // Update pet availability using existing fields in the Pet class
                    if (accepted) {
                        // Mark the pet as not available and update its status
                        pet.setAvailable(false);
                        pet.setStatus("Adopted"); // Using "Adopted" as a new status value
                        // Save the updated pet
                        petRepository.save(pet);

                        System.out.println("Pet " + petId + " has been adopted by user " + adopter.getId());
                    }
                }
            }

            // Send notification to shelter about decision
            if (shelterId != null) {
                String responseText = String.format(
                        "%s has %s the adoption of %s",
                        adopter.getFirstName() != null && adopter.getLastName() != null ?
                                adopter.getFirstName() + " " + adopter.getLastName() :
                                adopter.getEmailAddress(),
                        accepted ? "ACCEPTED" : "DECLINED",
                        petName
                );

                notificationsService.createNotificationForShelter(responseText, shelterId);
            }

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("accepted", accepted);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing adopter response: " + e.getMessage());
        }
    }

}