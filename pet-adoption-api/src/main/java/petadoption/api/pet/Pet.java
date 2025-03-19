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

    @Column(name = "IMAGE_URL")
    private String imageUrl;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "RATING")
    private Double rating;
}
