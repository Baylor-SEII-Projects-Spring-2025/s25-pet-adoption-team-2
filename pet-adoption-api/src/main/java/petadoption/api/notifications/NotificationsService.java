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

    public Notifications createNotification(String text, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Notifications notification = new Notifications();
        notification.setText(text);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUser(user);
        return notificationRepository.save(notification);
    }

    public List<Notifications> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notifications> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalse();
    }

    public List<Notifications> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUser_Id(userId);
    }

    public Notifications markAsRead(Long notificationId) {
        Optional<Notifications> maybeNotification = notificationRepository.findById(notificationId);
        if (maybeNotification.isPresent()) {
            Notifications notification = maybeNotification.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        throw new RuntimeException("Notification not found");
    }

    public boolean doesNotificationTableExist() {
        try {
            notificationRepository.findAll();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
