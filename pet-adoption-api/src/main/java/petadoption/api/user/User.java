package petadoption.api.user;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Represents a user in the system (Adopter, Shelter, Admin).
 */
@Data
@Entity
@Table(name = "USERS") // Ensure table name matches your database schema
public class User {
    public static final String TABLE_NAME = "USERS";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Common strategy for auto-increment IDs
    @Column(name = "USER_ID")
    private Long id;

    @Column(name = "EMAIL_ADDRESS", unique = true, nullable = false) // Email should be unique and required
    private String emailAddress;

    @Column(name = "PASSWORD", nullable = false) // Password is required
    private String password; // Consider storing hashed passwords

    @Column(name = "USER_TYPE", nullable = false) // User type is required
    private String userType; // e.g., "ADOPTER", "SHELTER", "ADMIN"

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "PHONE")
    private String phone;

    @Column(name = "ADDRESS")
    private String address;

    // Specific to SHELTER users
    @Column(name = "SHELTER_NAME")
    private String shelterName;

    // --- Preference fields ---
    @Column(name = "PREFERRED_DOG_WEIGHT")
    private Double preferredDogWeight = 0.5;

    @Column(name = "PREFERRED_CAT_WEIGHT")
    private Double preferredCatWeight = 0.5;

    @Column(name = "TARGET_AGE")
    private Integer targetAge;

    @Column(name = "AGE_TOLERANCE")
    private Double ageTolerance;

    @Column(name = "TARGET_WEIGHT")
    private Integer targetWeight;

    @Column(name = "WEIGHT_TOLERANCE")
    private Double weightTolerance;

    @Column(name = "PREFERRED_MALE_WEIGHT")
    private Double preferredMaleWeight = 0.5;

    @Column(name = "PREFERRED_FEMALE_WEIGHT")
    private Double preferredFemaleWeight = 0.5;

    @Column(name = "PREFERRED_BREED")
    private String preferredBreed;

    @Column(name = "PREFERRED_SPECIES")
    private String preferredSpecies;

    @Column(name = "PREFERRED_GENDER")
    private String preferredGender;

    @Column(name = "PREFERRED_COAT_LENGTH")
    private String preferredCoatLength;

    @Column(name = "PREFERRED_HEALTH_STATUS")
    private String preferredHealthStatus;

    @Column(name="SPECIES_DISLIKE_COUNT", nullable=false)
    private Integer speciesDislikeCount = 0;

    @Column(name="BREED_DISLIKE_COUNT", nullable=false)
    private Integer breedDislikeCount   = 0;
}
