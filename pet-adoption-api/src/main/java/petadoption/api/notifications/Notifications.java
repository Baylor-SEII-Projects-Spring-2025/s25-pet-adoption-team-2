package petadoption.api.notifications;

import jakarta.persistence.*;
import lombok.Data;

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
    private java.time.LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private petadoption.api.user.User user;

    @Column(name = "REPLY_TEXT")
    private String replyText;
}
