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
@CrossOrigin(origins = "http://localhost:3000")
public class PetEndpoint {

    @Autowired
    private PetService petService;

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Pet> addPet(
            @ModelAttribute Pet pet,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            if (image != null && !image.isEmpty()) {
                pet.setImageUrl(storeImage(image));
            }
            Pet saved = petService.addPet(pet);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Pet>> getAllPets() {
        return ResponseEntity.ok(petService.getAllPets());
    }

    // --- helper to save file under `uploads/` + return “/uploads/…” URL ---
    private String storeImage(MultipartFile file) throws IOException {
        String uploadsDir = "uploads/";
        File dir = new File(uploadsDir);
        if (!dir.exists()) dir.mkdirs();

        String fname = System.currentTimeMillis()
                + "_" + file.getOriginalFilename().replace(" ", "_");
        Path dest = Paths.get(uploadsDir, fname);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + fname;
    }
}
