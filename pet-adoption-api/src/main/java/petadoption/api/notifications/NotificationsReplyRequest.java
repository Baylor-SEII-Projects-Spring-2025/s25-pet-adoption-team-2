package petadoption.api.notifications;

import lombok.Data;

@Data
public class NotificationsReplyRequest {
    private Long notificationId;
    private String reply;
}
