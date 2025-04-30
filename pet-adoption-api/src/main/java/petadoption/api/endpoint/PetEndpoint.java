package petadoption.api.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import petadoption.api.pet.Pet;
import petadoption.api.pet.PetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.persistence.EntityNotFoundException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Pet related operations like adding, fetching available,
 * fetching adopted, importing, and deleting pets.
 */
@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "${cors.allowed.origins:http://localhost:3000}")
public class PetEndpoint {

    private static final Logger log = LoggerFactory.getLogger(PetEndpoint.class);

    private final PetService petService;

    @Autowired
    public PetEndpoint(PetService petService) {
        this.petService = petService;
    }

    /**
     * Adds a new pet, potentially with an image upload.
     * Expects pet data as form fields and image as a multipart file part.
     */
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addPet(@ModelAttribute Pet pet,
                                    @RequestPart(value = "image", required = false) MultipartFile image) {
        log.info("API Request: Add pet '{}' for shelter {}", pet.getName(), pet.getAdoptionCenterId());
        try {
            if (image != null && !image.isEmpty()) {
                // Use the service to store the image instead of local method
                String storedPath = petService.storeImage(image);
                pet.setImageUrl(storedPath);
                log.info("Image uploaded for new pet: {}", storedPath);
            } else {
                log.info("No image uploaded for new pet '{}'", pet.getName());
                pet.setImageUrl(null); // Ensure imageUrl is null if no file uploaded
            }
            // Basic validation before saving
            if (pet.getName() == null || pet.getName().trim().isEmpty() || pet.getAdoptionCenterId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Pet name and shelter ID are required."));
            }

            Pet savedPet = petService.addPet(pet);
            // Consider returning a PetDTO if Pet entity has sensitive or complex fields
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPet); // Return 201 Created
        } catch (IOException e) {
            log.error("Failed to store image for new pet: {}", e.getMessage(), e);
            // Provide a more user-friendly error message
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to process uploaded image."));
        } catch (Exception e) {
            log.error("Failed to add pet: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to add pet: " + e.getMessage()));
        }
    }

    /**
     * Imports pets from a predefined CSV file in the classpath resources.
     */
    @GetMapping("/import-csv")
    public ResponseEntity<?> importCSV() {
        log.info("API Request: Import pets from classpath CSV.");
        try {
            List<Pet> importedPets = petService.importPetsFromCSV();
            log.info("Successfully imported {} pets from CSV file.", importedPets.size());
            // Consider returning DTO list if Pet entity is complex
            return ResponseEntity.ok(importedPets);
        } catch (IOException e) {
            log.error("Error importing CSV file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error importing CSV file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during CSV import: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred during CSV import."));
        }
    }

    /**
     * Imports pets from CSV data provided in the request body.
     */
    @PostMapping("/import-csv")
    public ResponseEntity<?> importCSVData(@RequestBody String csvData) {
        log.info("API Request: Import pets from CSV data string.");
        if (csvData == null || csvData.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "CSV data cannot be empty."));
        }
        try {
            List<Pet> importedPets = petService.importPetsFromCSVData(csvData);
            log.info("Successfully imported {} pets from CSV data.", importedPets.size());
            // Consider returning DTO list
            return ResponseEntity.ok(importedPets);
        } catch (IOException e) {
            log.error("Error importing CSV data: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error parsing or processing CSV data: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during CSV data import: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred during CSV data import."));
        }
    }

    /**
     * Deletes ALL pets from the database. Requires appropriate authorization.
     */
    @DeleteMapping("/all")
    // Add security annotation here, e.g., @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllPets() {
        log.warn("API Request: DELETE ALL PETS received.");
        // Add authorization check here before proceeding
        try {
            petService.deleteAllPets();
            return ResponseEntity.ok().build(); // 200 OK on successful deletion
        } catch (Exception e) {
            log.error("Error deleting all pets: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/pets?page=0&size=6
     * Returns a paginated list of AVAILABLE pets for the public adoption page.
     */
    @GetMapping
    public ResponseEntity<Page<Pet>> getAvailablePets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
            // Add @RequestParam for sorting if needed, e.g., sort=name,asc
    ) {
        log.info("API Request: Get available pets - Page: {}, Size: {}", page, size);
        try {
            // Example sorting by ID ascending. Allow frontend to specify sort?
            Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
            Page<Pet> petPage = petService.getAllAvailablePets(pageable);
            // Returning Page<Pet> might cause serialization issues if Pet has lazy fields.
            // Consider mapping Page<Pet> to Page<PetDTO> here.
            return ResponseEntity.ok(petPage);
        } catch (Exception e) {
            log.error("Error fetching available pets: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/pets/adopter/{userId}
     * Returns a list of pets adopted by a specific user for their profile page.
     */
    @GetMapping("/adopter/{userId}")
    public ResponseEntity<List<Pet>> getAdoptedPetsByUser(@PathVariable Long userId) {
        log.info("API Request: Get pets adopted by user ID: {}", userId);
        try {
            // Add check if user exists? Optional.
            List<Pet> adoptedPets = petService.getPetsByAdopter(userId);
            // Consider returning PetDTO list
            return ResponseEntity.ok(adoptedPets);
        } catch (Exception e) {
            log.error("Error fetching adopted pets for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/pets/shelter/{shelterId}
     * Returns a list of pets listed by a specific shelter for their profile page.
     */
    @GetMapping("/shelter/{shelterId}")
    public ResponseEntity<List<Pet>> getPetsByShelter(@PathVariable Long shelterId) {
        log.info("API Request: Get pets listed by shelter ID: {}", shelterId);
        try {
            // Add check if shelter exists? Optional.
            List<Pet> shelterPets = petService.getPetsByShelter(shelterId);
            // Consider returning PetDTO list
            return ResponseEntity.ok(shelterPets);
        } catch (Exception e) {
            log.error("Error fetching pets for shelter {}: {}", shelterId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Optional: Endpoints for ALL pets (admin use) ---
    // These should be secured and ideally return DTOs with pagination.

    // @GetMapping("/all-paged")
    // @PreAuthorize("hasRole('ADMIN')") // Example security
    // public ResponseEntity<Page<Pet>> getAllPetsPaged(Pageable pageable) {
    //     log.info("API Request: Get ALL pets (paged) - Admin");
    //     Page<Pet> petPage = petService.getAllPets(pageable);
    //     // Map to DTOs: Page<PetDTO> dtoPage = petPage.map(petService::mapToPetDTO);
    //     return ResponseEntity.ok(petPage); // return dtoPage;
    // }

    // @GetMapping("/all-list")
    // @PreAuthorize("hasRole('ADMIN')") // Example security
    // public ResponseEntity<List<Pet>> getAllPetsList() {
    //     log.info("API Request: Get ALL pets (list) - Admin");
    //     List<Pet> list = petService.getAllPetsList();
    //     // Map to DTOs: List<PetDTO> dtoList = list.stream().map(petService::mapToPetDTO).collect(Collectors.toList());
    //     return ResponseEntity.ok(list); // return dtoList;
    // }
}