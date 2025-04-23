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
 * - age: Pet's age in years (must be a positive integer)
 * - weight (in lbs):
 *    For Dogs:
 *       small: 0-25 lbs, medium: 26-60 lbs, large: 61-100 lbs, extra large: >100 lbs.
 *    For Cats:
 *       small: 0-6 lbs, medium: 7-11 lbs, large: 12-16 lbs, extra large: >16 lbs.
 *
 * Other fields:
 * - breed: Free-text field where the breed is typed in. (The breed value will later be stored in the database for filtering/searching.)
 * - status: "Pending", "Verified", or "Rejected" (default is "Pending")
 * - available: Boolean indicating if the pet is available for adoption.
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

    // Pet name (free text)
    @Column(name = "NAME", nullable = false)
    private String name;

    // Age in years (must be a positive integer)
    @Column(name = "AGE", nullable = false)
    private Integer age;

    // Species: Only possible values: "Dog" or "Cat"
    @Column(name = "SPECIES", nullable = false)
    private String species;

    // Breed: Free text – will be stored and later used for filtering/searching.
    @Column(name = "BREED", nullable = false)
    private String breed;

    // Gender: Only possible values: "Male", "Female", or "Other"
    @Column(name = "GENDER", nullable = false)
    private String gender;

    // Health Status: Only possible values: "Excellent", "Good", "Fair", "Poor"
    @Column(name = "HEALTH_STATUS", nullable = false)
    private String healthStatus;

    // Weight in pounds.
    // For Dogs: small: 0-25, medium: 26-60, large: 61-100, extra large: >100.
    // For Cats: small: 0-6, medium: 7-11, large: 12-16, extra large: >16.
    @Column(name = "WEIGHT", nullable = false)
    private Integer weight;

    // Coat Length: Only possible values: "Hairless", "Short", "Medium", "Long"
    @Column(name = "COAT_LENGTH")
    private String coatLength;

    // URL to the pet's image (optional)
    @Column(name = "IMAGE_URL", length = 2048)
    private String imageUrl;

    // Description (free text)
    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    // Adoption Center ID: links this pet to its adoption center.
    @Column(name = "ADOPTION_CENTER_ID", nullable = false)
    private Long adoptionCenterId;

    // Status: "Pending", "Verified", or "Rejected" (default is "Pending")
    @Column(name = "STATUS", nullable = false)
    private String status = "Pending";

    // Available: true if pet is available for adoption, false otherwise.
    @Column(name = "AVAILABLE", nullable = false)
    private Boolean available = true;

    /**
     * Derived property that returns the pet size as a string based on the weight and species.
     *
     * For Dogs:
     *   - small: weight ≤ 25 lbs
     *   - medium: 26 ≤ weight ≤ 60 lbs
     *   - large: 61 ≤ weight ≤ 100 lbs
     *   - extra large: weight > 100 lbs
     *
     * For Cats:
     *   - small: weight ≤ 6 lbs
     *   - medium: 7 ≤ weight ≤ 11 lbs
     *   - large: 12 ≤ weight ≤ 16 lbs
     *   - extra large: weight > 16 lbs
     *
     * @return size as a String ("small", "medium", "large", "extra large", or "Unknown" if weight is null)
     */
    @Transient
    public String getSize() {
        if (weight == null) {
            return "Unknown";
        } else if (species != null && species.equalsIgnoreCase("Cat")) {
            if (weight <= 6) return "small";
            else if (weight <= 11) return "medium";
            else if (weight <= 16) return "large";
            else return "extra large";
        } else { // Default: assume Dog if not a Cat
            if (weight <= 25) return "small";
            else if (weight <= 60) return "medium";
            else if (weight <= 100) return "large";
            else return "extra large";
        }
    }
}
