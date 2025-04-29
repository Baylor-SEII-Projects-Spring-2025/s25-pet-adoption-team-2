package petadoption.api.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import petadoption.api.pet.Pet;
import petadoption.api.pet.PetRepository;
import petadoption.api.pet.PetService;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "http://localhost:3000")
public class PetEndpoint {

    @Autowired
    private PetService petService;

    @Autowired
    private PetRepository petRepository;

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Pet> addPet(@ModelAttribute Pet pet,
                                      @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            if (image != null && !image.isEmpty()) {
                String storedPath = storeImage(image);
                pet.setImageUrl(storedPath);
            }
            Pet savedPet = petService.addPet(pet);
            return ResponseEntity.ok(savedPet);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Helper method to store the uploaded image file
    private String storeImage(MultipartFile file) throws IOException {
        String uploadsDir = "uploads/";
        File uploadDir = new File(uploadsDir);
        if (!uploadDir.exists() && !uploadDir.mkdirs()) {
            throw new IOException("Failed to create uploads directory");
        }
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadsDir, fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        // Return a URL path (adjust as needed for your hosting)
        return "/" + uploadsDir + fileName;
    }

    @GetMapping("/import-csv")
    public ResponseEntity<?> importCSV() {
        try {
            List<Pet> importedPets = petService.importPetsFromCSV();
            return ResponseEntity.ok(importedPets);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error importing CSV file: " + e.getMessage());
        }
    }

    @PostMapping("/import-csv")
    public ResponseEntity<?> importCSV(@RequestBody String csvData) {
        try {
            List<Pet> importedPets = petService.importPetsFromCSVData(csvData);
            return ResponseEntity.ok(importedPets);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error importing CSV data: " + e.getMessage());
        }
    }

    /**
     * DELETE /api/pets/all
     * Deletes every pet in the database.
     */
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllPets() {
        petService.deleteAllPets();
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/pets?page=0&size=6
     * returns a Page<Pet> JSON with content, totalPages, totalElements, etc.
     */
    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<Pet>> getPets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        var pg = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id"));
        return ResponseEntity.ok(petService.getAllPets(pg));
    }
    
    /** GET /api/pets/all → returns List<Pet> */
    @GetMapping("/all")
    public ResponseEntity<List<Pet>> getAllPets() {
        List<Pet> list = petService.getAllPetsList();
        return ResponseEntity.ok(list);
    }


}