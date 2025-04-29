package petadoption.api.notifications;

import lombok.Data;

@Data
public class NotificationsRequest {
    private String text;
    private Long userId;
    private String displayName;
    private Long petId;

    // Getters and setters with null checks

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getDisplayName() {
        return displayName != null ? displayName : "";
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    @Override
    public String toString() {
        return "NotificationsRequest{" +
                "text='" + text + '\'' +
                ", userId=" + userId +
                ", displayName='" + displayName + '\'' +
                ", petId=" + petId +
                '}';
    }
}