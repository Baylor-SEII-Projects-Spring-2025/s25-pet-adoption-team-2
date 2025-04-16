package petadoption.api.pet;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Represents an adoptable pet.
 *
 * Dropdown field possible values:
 * - species: "Dog" or "Cat"
 * - gender: "Male", "Female", or "Other"
 * - healthStatus: "Excellent", "Good", "Fair", "Poor"
 * - coatLength: "Hairless", "Short", "Medium", "Long"
 *
 * Numeric value ranges:
 * - age: Pet's age in years (must be positive)
 * - weight (lbs):
 *    Dogs: small 0–25, medium 26–60, large 61–100, extra large >100
 *    Cats: small 0–6, medium 7–11, large 12–16, extra large >16
 *
 * Other fields:
 * - breed: free text
 * - status: "Pending", "Verified", "Rejected" (default "Pending")
 * - available: boolean (default true)
 */
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

    @Column(name = "WEIGHT", nullable = false)
    private Integer weight;

    @Column(name = "COAT_LENGTH")
    private String coatLength;

    @Column(name = "IMAGE_URL")
    private String imageUrl;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "ADOPTION_CENTER_ID", nullable = false)
    private Long adoptionCenterId;

    @Column(name = "STATUS", nullable = false)
    private String status = "Pending";

    @Column(name = "AVAILABLE", nullable = false)
    private Boolean available = true;

    /**
     * Derived property: returns size string based on species + weight.
     */
    @Transient
    public String getSize() {
        if (weight == null) return "Unknown";

        if ("Cat".equalsIgnoreCase(species)) {
            if (weight <= 6)   return "small";
            if (weight <= 11)  return "medium";
            if (weight <= 16)  return "large";
            return "extra large";
        } else { // Dog or default
            if (weight <= 25)  return "small";
            if (weight <= 60)  return "medium";
            if (weight <= 100) return "large";
            return "extra large";
        }
    }
}
