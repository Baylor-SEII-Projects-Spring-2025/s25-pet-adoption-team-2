package petadoption.api.pet;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.io.File;
import java.util.ArrayList;
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

    public List<Pet> importPetsFromCSV() throws IOException {
        List<Pet> pets = new ArrayList<>();
        // Load CSV file from the classpath: src/main/resources/data/MOCK_DATA (3).csv
        Resource resource = new ClassPathResource("data/MOCK_DATA (3).csv");
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            // Parse CSV with Apache Commons CSV, using the first record as header.
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .withFirstRecordAsHeader()
                    .withIgnoreHeaderCase()
                    .withTrim()
                    .parse(reader);
            for (CSVRecord record : records) {
                try {
                    // CSV columns assumed header names:
                    // PET_ID, NAME, AGE, SPECIES, BREED, GENDER, HEALTH_STATUS, WEIGHT, COAT_LENGTH, IMAGE_URL, DESCRIPTION, ADOPTION_CENTER_ID, STATUS, AVAILABLE
                    Pet pet = new Pet();
                    pet.setName(record.get("NAME"));
                    pet.setAge(Integer.parseInt(record.get("AGE")));
                    pet.setSpecies(record.get("SPECIES"));
                    pet.setBreed(record.get("BREED"));
                    pet.setGender(record.get("GENDER"));
                    pet.setHealthStatus(record.get("HEALTH_STATUS"));
                    pet.setWeight(Integer.parseInt(record.get("WEIGHT")));
                    pet.setCoatLength(record.get("COAT_LENGTH"));
                    pet.setImageUrl(record.get("IMAGE_URL"));
                    pet.setDescription(record.get("DESCRIPTION"));
                    pet.setAdoptionCenterId(Long.parseLong(record.get("ADOPTION_CENTER_ID")));
                    pet.setStatus(record.get("STATUS"));
                    pet.setAvailable(Boolean.parseBoolean(record.get("AVAILABLE")));
                    pets.add(pet);
                } catch (NumberFormatException e) {
                    // Log a warning and skip this record if parsing fails.
                    System.err.println("Warning: Failed to parse record " + record.toString() + " due to: " + e.getMessage());
                }
            }
        }
        // Save all imported pets to the database.
        return petRepository.saveAll(pets);
    }
}
