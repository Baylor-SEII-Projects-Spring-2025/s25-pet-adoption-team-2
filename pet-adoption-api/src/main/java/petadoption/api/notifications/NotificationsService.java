package petadoption.api.notifications;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
public class NotificationsService {

    private final NotificationsRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationsService(NotificationsRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<Notifications> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notifications> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalse();
    }

    public List<Notifications> getNotificationsByUserId(Long userId) {
        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Log for debugging
        System.out.println("Getting notifications for user: " + userId +
                ", User type: " + user.getUserType());

        // Retrieve ALL notifications for this user, not just unread ones
        List<Notifications> notifications = notificationRepository.findByUser_Id(userId);

        // Log the results
        System.out.println("Found " + notifications.size() + " notifications");

        return notifications;
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

    public Notifications replyToNotification(Long notificationId, String replyText) {
        // Get the original notification
        Notifications originalNotification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Get the user who received the original notification
        User currentRecipient = originalNotification.getUser();

        // Check the user type to determine if this is an adopter replying to a shelter or vice versa
        boolean isAdopterReplying = !"SHELTER".equals(currentRecipient.getUserType());

        if (isAdopterReplying) {
            // ADOPTER REPLYING TO SHELTER
            System.out.println("Adopter is replying to shelter message");

            try {
                // Find shelters specifically by userType
                List<User> shelters = userRepository.findByUserType("SHELTER");
                if (shelters.isEmpty()) {
                    throw new RuntimeException("No shelter users found in the system");
                }

                // Get the first shelter (or ideally the shelter that sent the original message)
                User shelter = shelters.get(0);

                // Mark original notification as read
                originalNotification.setRead(true);
                originalNotification.setReplyText(replyText);
                notificationRepository.save(originalNotification);

                // Create a new notification for the shelter with a consistent prefix
                Notifications shelterNotification = new Notifications();
                shelterNotification.setText("Response from adopter: " + replyText);
                shelterNotification.setRead(false);
                shelterNotification.setCreatedAt(LocalDateTime.now());
                shelterNotification.setUser(shelter);

                // Debug info
                System.out.println("Creating notification for shelter ID: " + shelter.getId());

                // Save the new notification
                Notifications saved = notificationRepository.save(shelterNotification);
                System.out.println("Created shelter notification with ID: " + saved.getId());

                return saved;
            } catch (Exception e) {
                System.err.println("Error in adopter reply: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to send reply: " + e.getMessage());
            }
        } else {
            // SHELTER REPLYING TO ADOPTER
            System.out.println("Shelter is replying to adopter message");

            try {
                // Try to extract the user ID from the notification text
                final Long extractedAdopterId;

                // If the notification text contains a reference to a specific user ID, use that
                Pattern pattern = Pattern.compile("\\(ID: (\\d+)\\)");
                Matcher matcher = pattern.matcher(originalNotification.getText());
                if (matcher.find()) {
                    extractedAdopterId = Long.parseLong(matcher.group(1));
                    System.out.println("Extracted adopter ID: " + extractedAdopterId);
                } else {
                    // If we couldn't extract an ID, find a non-shelter user
                    List<User> adopters = userRepository.findByUserTypeNot("SHELTER");
                    if (!adopters.isEmpty()) {
                        extractedAdopterId = adopters.get(0).getId();
                        System.out.println("Using fallback adopter ID: " + extractedAdopterId);
                    } else {
                        throw new RuntimeException("No adopter users found");
                    }
                }

                // Get the adopter user
                User adopter = userRepository.findById(extractedAdopterId)
                        .orElseThrow(() -> new RuntimeException("Adopter user not found with ID: " + extractedAdopterId));

                // Mark original notification as read
                originalNotification.setRead(true);
                originalNotification.setReplyText(replyText);
                notificationRepository.save(originalNotification);

                // Create a new notification for the adopter
                Notifications adopterNotification = new Notifications();
                adopterNotification.setText("Shelter response: " + replyText);
                adopterNotification.setRead(false);
                adopterNotification.setCreatedAt(LocalDateTime.now());
                adopterNotification.setUser(adopter);

                // Save and return the new notification
                return notificationRepository.save(adopterNotification);
            } catch (Exception e) {
                System.err.println("Error in shelter reply: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to send reply: " + e.getMessage());
            }
        }
    }

    private Long extractUserIdFromText(String text) {
        try {
            // Pattern for "New adoption request from {displayName} (ID: {userId}) for pet..."
            Pattern pattern = Pattern.compile("\\(ID: (\\d+)\\)");
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                return Long.parseLong(matcher.group(1));
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private Long findShelterToReplyTo() {
        // Get the first available shelter as a fallback
        List<User> shelters = userRepository.findByUserType("SHELTER");
        if (!shelters.isEmpty()) {
            return shelters.get(0).getId();
        }
        return null;
    }

    public Notifications createNotificationForShelter(String text, Long shelterId) {
        try {
            // Validate inputs
            if (text == null || text.trim().isEmpty()) {
                throw new IllegalArgumentException("Notification text cannot be empty");
            }

            if (shelterId == null) {
                throw new IllegalArgumentException("Shelter ID cannot be null");
            }

            // Find the shelter
            User shelter = userRepository.findById(shelterId)
                    .orElseThrow(() -> new RuntimeException("Shelter not found with ID: " + shelterId));

            // Create and save the notification
            Notifications notification = new Notifications();
            notification.setText(text);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setUser(shelter);
            return notificationRepository.save(notification);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error creating notification for shelter: " + e.getMessage());
            throw e; // Rethrow to let the controller handle it
        }
    }

    // Method to create notification for any user
    public Notifications createNotificationForUser(String text, Long userId) {
        try {
            if (text == null || text.trim().isEmpty()) {
                throw new IllegalArgumentException("Notification text cannot be empty");
            }

            if (userId == null) {
                throw new IllegalArgumentException("User ID cannot be null");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            Notifications notification = new Notifications();
            notification.setText(text);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setUser(user);
            return notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error creating notification for user: " + e.getMessage());
            throw e;
        }
    }

    // Method to get notification by ID
    public Notifications getNotification(Long id) {
        return notificationRepository.findById(id).orElse(null);
    }
}