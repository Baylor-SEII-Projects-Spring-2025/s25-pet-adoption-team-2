package petadoption.api.notifications; // Or a dto subpackage

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for sending Notification information to the frontend.
 */
@Data // Adds getters, setters, toString, etc. automatically
@NoArgsConstructor // Needed for frameworks like Jackson or MapStruct
public class NotificationDTO {
    private Long id;
    private String text;
    private boolean isRead;
    private LocalDateTime createdAt; // Keep as LocalDateTime, Jackson handles default serialization
    private String senderInfo; // Example: "Shelter Name (shelter@example.com)" or "Adopter Name (adopter@email.com)"
    private String recipientInfo;
    private Long petId;
    private Long adopterId;// Example: "Adopter Name (adopter@email.com)"

    // You can add more fields here if needed by the frontend,
    // like specific flags for approval requests, etc.

    // Optional constructor for easier manual mapping if needed
    public NotificationDTO(Long id, String text, boolean isRead, LocalDateTime createdAt, String senderInfo, String recipientInfo) {
        this.id = id;
        this.text = text;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.senderInfo = senderInfo;
        this.recipientInfo = recipientInfo;
    }
}
