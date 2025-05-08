package petadoption.api.pet;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Represents an adoptable pet. Includes status and adopter tracking.
 */
@Data
@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PET_ID", nullable = false, updatable = false) // Primary key shouldn't be updatable
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

    @Column(name = "WEIGHT", nullable = false)
    private Integer weight;

    @Column(name = "COAT_LENGTH")
    private String coatLength;

    @Column(name = "IMAGE_URL", length = 2048)
    private String imageUrl;

    @Lob
    @Column(name = "DESCRIPTION", columnDefinition = "MEDIUMTEXT")
    private String description;

    @Column(name = "adoption_center_id", nullable = false)
    private Long adoptionCenterId;

    @Column(name = "STATUS", nullable = false)
    private String status = "Pending";

    @Column(name = "AVAILABLE", nullable = false)
    private Boolean available = true;

    @Column(name = "ADOPTER_ID", nullable = true)
    private Long adopterId;

    // --- Transient getSize() method ---
    @Transient
    public String getSize() {
        if (weight == null) {
            return "Unknown";
        } else if (species != null && species.equalsIgnoreCase("Cat")) {
            if (weight <= 6) return "small";
            else if (weight <= 11) return "medium";
            else if (weight <= 16) return "large";
            else return "extra large";
        } else {
            if (weight <= 25) return "small";
            else if (weight <= 60) return "medium";
            else if (weight <= 100) return "large";
            else return "extra large";
        }
    }
}
