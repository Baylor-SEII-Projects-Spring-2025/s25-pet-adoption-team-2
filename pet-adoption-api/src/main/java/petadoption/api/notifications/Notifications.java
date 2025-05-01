package petadoption.api.notifications;

import jakarta.persistence.*;
import lombok.Data;
import petadoption.api.user.User; // Make sure User import is present
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = Notifications.TABLE_NAME)
public class Notifications {
    public static final String TABLE_NAME = "NOTIFICATIONS";

    @Id
    @GeneratedValue(generator = TABLE_NAME + "_GENERATOR")
    @SequenceGenerator(
            name = TABLE_NAME + "_GENERATOR",
            sequenceName = TABLE_NAME + "_SEQUENCE"
    )
    @Column(name = "NOTIFICATION_ID")
    private Long id;

    @Column(name = "TEXT")
    private String text;

    @Column(name = "IS_READ")
    private boolean isRead;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "PET_ID")
    private Long petId;

    @Column(name = "ADOPTER_ID")
    private Long adopterId;

    @ManyToOne // This is the RECIPIENT of the notification
    @JoinColumn(name = "USER_ID", referencedColumnName = "USER_ID")
    private User user;

    // ADD THIS FIELD
    @ManyToOne(fetch = FetchType.LAZY) // Added fetch type for potential performance
    @JoinColumn(name = "SENDER_ID", referencedColumnName = "USER_ID", nullable = true) // Column for sender's user ID
    private User sender; // Represents the user who sent the notification

    @Column(name = "REPLY_TEXT") // Consider if this field is still needed with the new sender logic
    private String replyText;
}
