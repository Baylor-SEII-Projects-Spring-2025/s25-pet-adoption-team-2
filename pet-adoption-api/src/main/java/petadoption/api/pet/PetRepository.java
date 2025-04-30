package petadoption.api.pet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Add Repository annotation
import java.util.List;

/**
 * Spring Data JPA repository for Pet entities.
 */
@Repository // Indicate this is a Spring Data repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    /**
     * Finds available pets (available = true) with pagination.
     * Used for the main adoption page ('/adopt').
     * @param pageable Pagination and sorting information.
     * @return A Page of available Pet entities.
     */
    Page<Pet> findByAvailableTrue(Pageable pageable);

    /**
     * Finds pets adopted by a specific user ID.
     * Used for the adopter's "My Pets" profile tab.
     * @param adopterId The ID of the adopter user.
     * @return A list of pets adopted by the user (where adopterId matches).
     */
    List<Pet> findByAdopterId(Long adopterId);

    /**
     * Finds pets listed by a specific shelter ID.
     * Used for the shelter's "My Pets" profile tab.
     * @param adoptionCenterId The ID of the shelter (User ID).
     * @param pageable Pagination and sorting information.
     * @return A Page of pets listed by the shelter.
     */
    Page<Pet> findByAdoptionCenterId(Long adoptionCenterId, Pageable pageable);

    /**
     * Finds pets listed by a specific shelter ID (unpaged list).
     * Used for the shelter's "My Pets" profile tab if pagination isn't implemented there yet.
     * @param adoptionCenterId The ID of the shelter (User ID).
     * @return A List of pets listed by the shelter.
     */
    List<Pet> findByAdoptionCenterId(Long adoptionCenterId);


    // JpaRepository already provides:
    // - save(Pet entity)
    // - findById(Long id)
    // - findAll()
    // - findAll(Pageable pageable)
    // - deleteById(Long id)
    // - deleteAll()
    // ... and more
}
