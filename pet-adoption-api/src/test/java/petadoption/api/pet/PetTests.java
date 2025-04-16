/*package petadoption.api.pet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class PetTests {

    @Autowired
    private PetRepository petRepository;

    @Test
    public void testAddPetAndRetrieveIt() {
        Pet pet = new Pet();
        pet.setName("Buddy");
        pet.setAge(3);
        pet.setSpecies("Dog");
        pet.setBreed("Golden Retriever");
        pet.setGender("Male");
        pet.setHealthStatus("Healthy");
        pet.setImageUrl("PetTestURL"); // Example image URL
        pet.setDescription("happy");
        pet.setAdoptionCenterId(1L);

        Pet savedPet = petRepository.save(pet);

        Pet retrievedPet = petRepository.findById(savedPet.getId()).orElse(null);

        assertThat(retrievedPet).isNotNull();
        assertThat(retrievedPet.getName()).isEqualTo("Buddy");
        assertThat(retrievedPet.getAge()).isEqualTo(3);
        assertThat(retrievedPet.getSpecies()).isEqualTo("Dog");
        assertThat(retrievedPet.getBreed()).isEqualTo("Golden Retriever");
        assertThat(retrievedPet.getGender()).isEqualTo("Male");
        assertThat(retrievedPet.getHealthStatus()).isEqualTo("Healthy");
        assertThat(retrievedPet.getImageUrl()).isEqualTo("PetTestURL");
        assertThat(retrievedPet.getDescription()).isEqualTo("happy");
        assertThat(retrievedPet.getAdoptionCenterId()).isEqualTo(1L);
        assertThat(retrievedPet.getStatus()).isEqualTo("Pending");
        assertThat(retrievedPet.getAvailable()).isTrue();
    }
}*/