package petadoption.api.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import petadoption.api.pet.Pet;
import petadoption.api.pet.PetService;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "http://localhost:3001")
public class PetEndpoint {

    @Autowired
    private PetService petService;

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

    @GetMapping("/all")
    public ResponseEntity<List<Pet>> getAllPets() {
        return ResponseEntity.ok(petService.getAllPets());
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
}