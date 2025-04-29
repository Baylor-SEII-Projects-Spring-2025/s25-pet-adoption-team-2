package petadoption.api.user;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "email_address", nullable = false, unique = true)
    private String emailAddress;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String phone;
    private String address;

    @Column(name = "shelter_name")
    private String shelterName;

    @Column(name = "user_type")
    private String userType;

    // Preference weights for species (scale 0.0 to 1.0)
    @Column(name = "PREFERRED_DOG_WEIGHT")
    private Double preferredDogWeight = 0.5; // 50/50 dog cat by default

    @Column(name = "PREFERRED_CAT_WEIGHT")
    private Double preferredCatWeight = 0.5; // 50/50 dog cat by default


    @Column(name = "TARGET_AGE")
    private Integer targetAge;

    @Column(name = "AGE_TOLERANCE")
    private Double ageTolerance;


    @Column(name = "TARGET_WEIGHT")
    private Integer targetWeight;

    @Column(name = "WEIGHT_TOLERANCE")
    private Double weightTolerance;



    @Column(name = "PREFERRED_MALE_WEIGHT")
    private Double preferredMaleWeight = 0.5; // (0.0-1.0 again)

    @Column(name = "PREFERRED_FEMALE_WEIGHT")
    private Double preferredFemaleWeight = 0.5; // (0.0-1.0 again)


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
}
