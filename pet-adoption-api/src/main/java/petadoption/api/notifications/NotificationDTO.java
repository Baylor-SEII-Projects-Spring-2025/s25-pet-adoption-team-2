package petadoption.api.notifications; // Or a dto subpackage

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for sending Notification information to the frontend.
 */
@Data
@NoArgsConstructor
public class NotificationDTO {
    private Long id;
    private String text;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String senderInfo;
    private String recipientInfo;
    private Long petId;
    private Long adopterId;


    public NotificationDTO(Long id, String text, boolean isRead, LocalDateTime createdAt, String senderInfo, String recipientInfo) {
        this.id = id;
        this.text = text;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.senderInfo = senderInfo;
        this.recipientInfo = recipientInfo;
    }
}
