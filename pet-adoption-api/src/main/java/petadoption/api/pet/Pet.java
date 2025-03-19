package petadoption.api.pet;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "PETS")
public class Pet {
    public static final String TABLE_NAME = "PETS";

    @Id
    @GeneratedValue(generator = TABLE_NAME + "_GENERATOR")
    @SequenceGenerator(
            name = TABLE_NAME + "_GENERATOR",
            sequenceName = TABLE_NAME + "_SEQUENCE"
    )
    @Column(name = "PET_ID")
    private Long id;

    @Column(name = "NAME", nullable = false)
    private String name;

    @Column(name = "AGE", nullable = false)
    private Integer age;

    @Column(name = "SPECIES", nullable = false)
    private String species;

    @Column(name = "BREED", nullable = false)
    private String breed;

    @Column(name = "GENDER", nullable = false)
    private String gender;

    @Column(name = "HEALTH_STATUS", nullable = false)
    private String healthStatus;

    @Column(name = "IMAGE_URL")
    private String imageUrl;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "ADOPTION_CENTER_ID", nullable = false)
    private Long adoptionCenterId; // Links pet to its adoption center

    @Column(name = "STATUS", nullable = false)
    private String status = "Pending"; // "Pending", "Verified", "Rejected"

    @Column(name = "AVAILABLE", nullable = false)
    private Boolean available = true;
}
