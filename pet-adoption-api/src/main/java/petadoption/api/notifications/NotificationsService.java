package petadoption.api.notifications;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import petadoption.api.notifications.NotificationsRepository;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationsService {

    private final NotificationsRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationsService(NotificationsRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notifications createNotificationForAdoptionCenter(String text) {
        User adoptionCenter = userRepository.findByUserType("SHELTER")
                .orElseThrow(() -> new RuntimeException("Adoption Center account not found"));

        Notifications notification = new Notifications();
        notification.setText(text);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUser(adoptionCenter);

        return notificationRepository.save(notification);
    }

    public Notifications createNotification(String text, Long userId, String displayName) {
        // Find the shelter user based on the adoption center ID
        User shelter = userRepository.findByUserType("SHELTER")
                .orElseThrow(() -> new RuntimeException("Shelter user not found"));

        Notifications notification = new Notifications();
        notification.setText(text);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUser(shelter); // Set the notification to be sent to the shelter
        return notificationRepository.save(notification);
    }

    public List<Notifications> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notifications> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalse();
    }

    public List<Notifications> getNotificationsByUserId(Long userId) {
        // Return notifications for both shelter and regular users
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if ("SHELTER".equals(user.getUserType())) {
            return notificationRepository.findByUserId(userId);
        } else {
            // For regular users, return notifications where they are the recipient
            return notificationRepository.findByUserId(userId);
        }
    }

    public Notifications markAsRead(Long id) {
        Notifications notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public List<Notifications> getUnreadNotificationsByUserId(Long userId) {
        // Return unread notifications for both shelter and regular users
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if ("SHELTER".equals(user.getUserType())) {
            return notificationRepository.findByUserIdAndIsReadFalse(userId);
        } else {
            // For regular users, return unread notifications where they are the recipient
            return notificationRepository.findByUserIdAndIsReadFalse(userId);
        }
    }

    public Notifications createNotification(NotificationsRequest request) {
        // ... existing code ...
        return null; // Placeholder return, actual implementation needed
    }

    public boolean doesNotificationTableExist() {
        try {
            notificationRepository.findAll();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Notifications replyToNotification(Long notificationId, String replyText) {
        // Get the original notification
        Notifications originalNotification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Extract the original user's ID from the notification text
        // The text format is: "New adoption request from {displayName} (ID: {userId}) for pet ID {petId}"
        String text = originalNotification.getText();
        String[] parts = text.split("\\(");
        if (parts.length < 2) {
            throw new RuntimeException("Invalid notification format");
        }
        String userIdPart = parts[1].split("\\)")[0];
        Long originalUserId = Long.parseLong(userIdPart.split(":")[1].trim());

        // Get the original user
        User originalUser = userRepository.findById(originalUserId)
                .orElseThrow(() -> new RuntimeException("Original user not found"));

        // Mark the original notification as read
        originalNotification.setRead(true);
        originalNotification.setReplyText(replyText);
        notificationRepository.save(originalNotification);

        // Create a new notification for the original user
        Notifications userNotification = new Notifications();
        userNotification.setText("Shelter response: " + replyText);
        userNotification.setRead(false);
        userNotification.setCreatedAt(LocalDateTime.now());
        userNotification.setUser(originalUser); // Set to the original user who made the request
        return notificationRepository.save(userNotification);
    }
}
