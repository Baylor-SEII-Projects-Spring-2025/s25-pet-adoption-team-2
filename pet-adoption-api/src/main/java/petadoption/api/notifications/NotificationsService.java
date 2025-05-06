package petadoption.api.notifications;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors; // Import Collectors
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service layer for handling notification logic, including creation, retrieval,
 * marking as read, and replying. Uses NotificationDTO for data transfer to controller.
 */
@Service
@Transactional // Default transactionality for all public methods
public class NotificationsService {

    private static final Logger log = LoggerFactory.getLogger(NotificationsService.class);

    private final NotificationsRepository notificationRepository;
    private final UserRepository userRepository;

    // Constructor Injection
    public NotificationsService(NotificationsRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // --- Helper Method to Map Entity to DTO ---
    private NotificationDTO mapToDTO(Notifications notification) {
        if (notification == null) {
            return null;
        }
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setText(notification.getText());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setPetId(notification.getPetId());
        dto.setAdopterId(notification.getAdopterId());

        User sender = notification.getSender();
        if (sender != null) {
            // Customize sender info format as needed (e.g., add name if available)
            dto.setSenderInfo(sender.getEmailAddress());
        } else {
            dto.setSenderInfo("System"); // Or null
        }

        User recipient = notification.getUser();
        if (recipient != null) {
            dto.setRecipientInfo(recipient.getEmailAddress());
        } else {
            dto.setRecipientInfo(null);
        }
        return dto;
    }

    /**
     * Retrieves a single notification entity by ID. Primarily for internal service use.
     * Consider if this needs to return a DTO if called directly by less controlled code.
     * @param id Notification ID.
     * @return The Notification entity or null if not found.
     */
    @Transactional(readOnly = true)
    public Notifications getNotification(Long id) {
        log.debug("Attempting to find notification entity by ID: {}", id);
        return notificationRepository.findById(id).orElse(null);
    }

    /**
     * Retrieves all unread notifications for a specific user as DTOs.
     * @param userId The user ID.
     * @return A list of unread NotificationDTOs.
     * @throws EntityNotFoundException if the user is not found.
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotificationsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Attempted to get unread notifications for non-existent user ID: {}", userId);
                    return new EntityNotFoundException("User not found with ID: " + userId);
                });

        log.info("Fetching unread notifications DTOs for user ID: {}", userId);
        List<Notifications> notifications = notificationRepository.findByUser_IdAndIsReadFalse(userId);

        List<NotificationDTO> dtos = notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        log.info("Found {} unread notifications for user {}, returning DTOs", dtos.size(), userId);
        return dtos;
    }

    /**
     * Retrieves all notifications for a specific user as DTOs, ordered descending by creation date.
     * @param userId The user ID.
     * @return A list of NotificationDTOs for the user.
     * @throws EntityNotFoundException if the user is not found.
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            log.warn("Attempted to get all notifications for non-existent user ID: {}", userId);
            throw new EntityNotFoundException("User not found with ID: " + userId);
        }
        log.info("Fetching all notifications DTOs for user ID: {}", userId);
        List<Notifications> notifications = notificationRepository.findAllByUserIdOrdered(userId);

        List<NotificationDTO> dtos = notifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        log.info("Found {} total notifications for user {}, returning DTOs", dtos.size(), userId);
        return dtos;
    }

    /**
     * Marks a notification as read and returns its DTO representation.
     * @param id The ID of the notification.
     * @return The updated NotificationDTO.
     * @throws EntityNotFoundException if the notification is not found.
     */
    public NotificationDTO markAsRead(Long id) {
        Notifications notification = notificationRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Attempted to mark non-existent notification as read, ID: {}", id);
                    return new EntityNotFoundException("Notification not found with ID: " + id);
                });

        if (!notification.isRead()) {
            log.info("Marking notification ID: {} as read", id);
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        } else {
            log.debug("Notification ID: {} was already marked as read", id);
        }
        return mapToDTO(notification);
    }

    /**
     * Creates a notification for a specific user, returning the DTO representation.
     * @param text            Notification text.
     * @param recipientUserId ID of the recipient user.
     * @param senderUser      Sender user entity (can be null).
     * @return The created NotificationDTO.
     */
    public NotificationDTO createNotificationForUser(String text, Long recipientUserId, User senderUser) {
        if (text == null || text.trim().isEmpty()) throw new IllegalArgumentException("Notification text cannot be empty");
        if (recipientUserId == null) throw new IllegalArgumentException("Recipient User ID cannot be null");

        User recipient = userRepository.findById(recipientUserId)
                .orElseThrow(() -> new EntityNotFoundException("Recipient user not found with ID: " + recipientUserId));

        Notifications notification = new Notifications();
        notification.setText(text);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUser(recipient);
        if (senderUser != null) {
            notification.setSender(senderUser);
        }

        Notifications savedNotification = notificationRepository.save(notification);
        log.info("Created notification ID {} for user ID {}", savedNotification.getId(), recipientUserId);
        return mapToDTO(savedNotification);
    }

    // Overload without sender
    public NotificationDTO createNotificationForUser(String text, Long recipientUserId) {
        return createNotificationForUser(text, recipientUserId, null);
    }

    /**
     * Creates a notification for a specific shelter, returning the DTO representation.
     * @param text       Notification text.
     * @param shelterId  ID of the recipient shelter user.
     * @param senderUser Sender user entity (e.g., adopter) (can be null).
     * @return The created NotificationDTO.
     */
    public NotificationDTO createNotificationForShelter(String text, Long shelterId, User senderUser) {
        if (text == null || text.trim().isEmpty()) throw new IllegalArgumentException("Notification text cannot be empty");
        if (shelterId == null) throw new IllegalArgumentException("Shelter ID cannot be null");

        User shelter = userRepository.findById(shelterId)
                .orElseThrow(() -> new EntityNotFoundException("Shelter user not found with ID: " + shelterId));
        if (!"SHELTER".equals(shelter.getUserType())) {
            throw new IllegalArgumentException("User with ID " + shelterId + " is not a SHELTER user.");
        }

        Notifications notification = new Notifications();
        notification.setText(text);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUser(shelter);
        if (senderUser != null) {
            notification.setSender(senderUser);
        }

        Notifications savedNotification = notificationRepository.save(notification);
        log.info("Created notification ID {} for shelter ID {}", savedNotification.getId(), shelterId);
        return mapToDTO(savedNotification);
    }

    // Overload without sender
    public NotificationDTO createNotificationForShelter(String text, Long shelterId) {
        return createNotificationForShelter(text, shelterId, null);
    }

    /**
     * Processes a reply to an existing notification, creating a new notification for the correct recipient
     * (original sender) and returning its DTO representation.
     * @param notificationId The ID of the notification being replied to.
     * @param replyText The text of the reply.
     * @return The created NotificationDTO representing the reply.
     */
    public NotificationDTO replyToNotification(Long notificationId,
                                               String replyText,
                                               Long petId,
                                               Long adopterId) {
        if (replyText == null || replyText.trim().isEmpty()) {
            throw new IllegalArgumentException("Reply text cannot be empty");
        }

        Notifications originalNotification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Original notification not found with ID: " + notificationId));

        User recipientOfOriginal = originalNotification.getUser();
        User senderOfOriginal = originalNotification.getSender();

        if (recipientOfOriginal == null) {
            throw new IllegalStateException("Original notification ID " + notificationId + " is missing recipient user.");
        }

        boolean isAdopterReplying = !"SHELTER".equals(recipientOfOriginal.getUserType());

        Notifications replyNotification = new Notifications();
        replyNotification.setRead(false);
        replyNotification.setCreatedAt(LocalDateTime.now());
        replyNotification.setPetId(petId);
        replyNotification.setAdopterId(adopterId);

        // Extract potential adopter ID from notification text if sender is missing
        Long extractedAdopterId = null;
        if (senderOfOriginal == null && originalNotification.getText() != null) {
            try {
                Pattern pattern = Pattern.compile("(?:Adopter|Adoption request|from).*?ID: (\\d+)\\)");
                Matcher matcher = pattern.matcher(originalNotification.getText());
                if (matcher.find()) {
                    extractedAdopterId = Long.parseLong(matcher.group(1));
                    log.info("Extracted adopter ID {} from notification text", extractedAdopterId);
                }
            } catch (Exception e) {
                log.warn("Failed to extract adopter ID from notification text: {}", e.getMessage());
            }
        }

        if (isAdopterReplying) {
            // Adopter (recipientOfOriginal) replying to Shelter (senderOfOriginal)
            if (senderOfOriginal == null || !"SHELTER".equals(senderOfOriginal.getUserType())) {
                log.error("REPLY FAILED: Cannot determine recipient shelter for reply to notification ID: {}", notificationId);
                throw new IllegalStateException("Cannot determine recipient shelter. Original sender missing/invalid for notification ID: " + notificationId);
            }
            replyNotification.setUser(senderOfOriginal); // Reply goes TO shelter
            replyNotification.setSender(recipientOfOriginal); // Reply is FROM adopter
            replyNotification.setText(String.format("Response from %s: %s", recipientOfOriginal.getEmailAddress(), replyText));
            log.info("Creating reply from Adopter {} to Shelter {}", recipientOfOriginal.getId(), senderOfOriginal.getId());
        } else {
            // Shelter (recipientOfOriginal) replying to Adopter (senderOfOriginal)
            User adopter = null;

            // Try to use the original sender first
            if (senderOfOriginal != null && !"SHELTER".equals(senderOfOriginal.getUserType())) {
                adopter = senderOfOriginal;
            }
            // If that fails, try to find the adopter by ID extracted from the notification text
            else if (extractedAdopterId != null) {
                try {
                    adopter = userRepository.findById(extractedAdopterId)
                            .orElse(null);
                    if (adopter != null) {
                        log.info("Found adopter by ID {} extracted from notification text", extractedAdopterId);
                    }
                } catch (Exception e) {
                    log.error("Error looking up extracted adopter ID {}: {}", extractedAdopterId, e.getMessage());
                }
            }

            if (adopter == null) {
                log.error("REPLY FAILED: Cannot determine recipient adopter for reply to notification ID: {}", notificationId);
                throw new IllegalStateException("Cannot determine recipient adopter. Original sender missing/invalid for notification ID: " + notificationId);
            }

            replyNotification.setUser(adopter); // Reply goes TO adopter
            replyNotification.setSender(recipientOfOriginal); // Reply is FROM shelter
            replyNotification.setText("Shelter response: " + replyText);
            log.info("Creating reply from Shelter {} to Adopter {}", recipientOfOriginal.getId(), adopter.getId());
        }

        // Mark original as read (within the same transaction)
        if (!originalNotification.isRead()) {
            originalNotification.setRead(true);
            notificationRepository.save(originalNotification);
            log.debug("Marked original notification ID: {} as read after reply.", notificationId);
        }

        // Save the new reply notification
        Notifications savedReply = notificationRepository.save(replyNotification);
        log.info("Saved reply notification with ID: {}", savedReply.getId());

        // Return the DTO of the created reply
        return mapToDTO(savedReply);
    }

    // --- Deprecated / Internal Use Only ---
    // These methods returning raw entities might cause issues if used directly by controller

    @Transactional(readOnly = true)
    @Deprecated // Suggest using DTO version or ensuring controller doesn't use directly
    public List<Notifications> getAllNotifications() {
        log.warn("Deprecated getAllNotifications returning raw entities called.");
        return notificationRepository.findAll();
    }

    @Transactional(readOnly = true)
    @Deprecated // Suggest using DTO version or ensuring controller doesn't use directly
    public List<Notifications> getUnreadNotifications() {
        log.warn("Deprecated getUnreadNotifications returning raw entities called.");
        return notificationRepository.findByIsReadFalse();
    }

    // Helper method remains internal
    private Long extractUserIdFromText(String text) {
        if (text == null) return null;
        try {
            Pattern pattern = Pattern.compile("\\((?:Adopter\\s)?ID:\\s*(\\d+)\\)");
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                return Long.parseLong(matcher.group(1));
            }
        } catch (Exception e) {
            log.error("Error extracting user ID from text: {}", text, e);
        }
        return null;
    }

    // in NotificationsService.java :contentReference[oaicite:6]{index=6}&#8203;:contentReference[oaicite:7]{index=7}

    public NotificationDTO createAdoptionRequestNotification(
            String text,
            Long shelterId,
            User adopterUser,
            Long petId
    ) {
        if (text == null || text.trim().isEmpty()) throw new IllegalArgumentException("Notification text cannot be empty");
        if (shelterId == null) throw new IllegalArgumentException("Shelter ID cannot be null");

        // load shelter user…
        User shelter = userRepository.findById(shelterId)
                .orElseThrow(() -> new EntityNotFoundException("Shelter not found: " + shelterId));

        Notifications n = new Notifications();
        n.setText(text);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        n.setUser(shelter);
        n.setSender(adopterUser);
        // **new fields**
        n.setAdopterId(adopterUser.getId());
        n.setPetId(petId);

        Notifications saved = notificationRepository.save(n);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public NotificationDTO getNotificationById(Long id) {
        Notifications notif = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found: " + id));
        return mapToDTO(notif);
    }

}