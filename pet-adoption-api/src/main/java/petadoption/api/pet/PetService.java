package petadoption.api.pet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class PetService {

    @Autowired
    private PetRepository petRepository;

    public Pet addPet(Pet pet) {
        if (pet.getStatus() == null) {
            pet.setStatus("Pending");
        }
        if (pet.getAvailable() == null) {
            pet.setAvailable(true);
        }
        return petRepository.save(pet);
    }

    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }

    public String storeImage(MultipartFile file) throws IOException {
        // Define a directory to store uploads (ensure this folder is created or create it in code)
        String uploadsDir = "uploads/";
        File uploadDirFile = new File(uploadsDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
        }
        // Create a unique file name (for demo purposes, using current time)
        String filePath = uploadsDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File dest = new File(filePath);
        file.transferTo(dest);
        // Return the URL or relative path. Adjust according to how you plan to serve static files.
        return "/" + filePath;
    }
}