package petadoption.api.admin;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ADMIN_PASSWORDS")
public class AdminPassword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "ACTIVE", nullable = false)
    private Boolean active = true;

    @Column(name = "CREATED_DATE", nullable = false)
    private java.util.Date createdDate = new java.util.Date();
}