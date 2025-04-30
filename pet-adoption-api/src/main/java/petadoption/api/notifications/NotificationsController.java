package petadoption.api.notifications;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3001")
public class NotificationsController {

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
        return notificationsService.getUnreadNotificationsByUserId(userId);
    }

    @PostMapping
    public Notifications createNotification(@RequestBody NotificationsRequest request) {
        String notificationText = String.format("New adoption request from %s (ID: %d) for pet ID %s", 
            request.getDisplayName(), 
            request.getUserId(), 
            request.getText());
        return notificationsService.createNotification(notificationText, request.getUserId(), request.getDisplayName());
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
}
