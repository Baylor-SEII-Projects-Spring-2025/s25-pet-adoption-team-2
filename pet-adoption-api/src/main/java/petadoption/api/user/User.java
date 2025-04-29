package petadoption.api.user;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = User.TABLE_NAME)
public class User {
    public static final String TABLE_NAME = "USERS";

    @Id
    @SequenceGenerator(
            name = TABLE_NAME + "_GENERATOR",
            sequenceName = TABLE_NAME + "_SEQUENCE",
            allocationSize = 1    // <- fetch one value at a time
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = TABLE_NAME + "_GENERATOR"
    )
    @Column(name = "USER_ID")
    private Long id;

    @Column(name = "EMAIL_ADDRESS")
    private String emailAddress;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "USER_TYPE")
    private String userType;

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "PHONE")
    private String phone;

    @Column(name = "ADDRESS")
    private String address;

    @Column(name = "SHELTER_NAME")
    private String shelterName;

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
