package petadoption.api.notifications;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
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
        return notificationsService.getNotificationsByUserId(userId);
    }

    @PostMapping
    public Notifications createNotification(@RequestBody NotificationsRequest request) {
        return notificationsService.createNotification(request.getText(), request.getUserId());
    }

    @PutMapping("/{notificationId}/read")
    public Notifications markNotificationAsRead(@PathVariable Long notificationId) {
        return notificationsService.markAsRead(notificationId);
    }
}
