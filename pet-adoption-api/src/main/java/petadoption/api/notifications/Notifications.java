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

    @ManyToOne
    @JoinColumn(name = "USER_ID", referencedColumnName = "USER_ID")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SENDER_ID", referencedColumnName = "USER_ID", nullable = true)
    private User sender;

    @Column(name = "REPLY_TEXT")
    private String replyText;
}
