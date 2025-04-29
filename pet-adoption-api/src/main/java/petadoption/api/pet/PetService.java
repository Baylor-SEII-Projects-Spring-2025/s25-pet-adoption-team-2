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

    public org.springframework.data.domain.Page<Pet> getAllPets(org.springframework.data.domain.Pageable pg) {
        return petRepository.findAll(pg);
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

    public List<Pet> importPetsFromCSVData(String csvData) throws IOException {
        List<Pet> pets = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new java.io.StringReader(csvData))) {
            // Parse CSV with Apache Commons CSV, using the first record as header
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .withFirstRecordAsHeader()
                    .withIgnoreHeaderCase()
                    .withTrim()
                    .parse(reader);

            // Print headers for debugging
            System.out.println("CSV Headers: " + records.iterator().next().getParser().getHeaderNames());

            for (CSVRecord record : records) {
                try {
                    System.out.println("Processing record: " + record.toString());
                    Pet pet = new Pet();

                    // Use safe getters that handle missing columns
                    pet.setName(getValueOrDefault(record, "NAME", ""));
                    pet.setAge(getIntValueOrDefault(record, "AGE", 0));
                    pet.setSpecies(getValueOrDefault(record, "SPECIES", ""));
                    pet.setBreed(getValueOrDefault(record, "BREED", ""));
                    pet.setGender(getValueOrDefault(record, "GENDER", ""));
                    pet.setHealthStatus(getValueOrDefault(record, "HEALTH_STATUS", ""));
                    pet.setWeight(getIntValueOrDefault(record, "WEIGHT", 0));
                    pet.setCoatLength(getValueOrDefault(record, "COAT_LENGTH", ""));

                    // Handle image URL
                    String imageUrl = getValueOrDefault(record, "IMAGE_URL", "");
                    if (!imageUrl.isEmpty() && !imageUrl.startsWith("http")) {
                        // Try to get the next columns until we find a non-URL part
                        StringBuilder fullUrl = new StringBuilder(imageUrl);
                        int currentIndex = 9; // IMAGE_URL is at index 9
                        try {
                            while (true) {
                                String nextPart = record.get(currentIndex + 1);
                                if (nextPart.matches("\\d+") || // Is a number
                                    nextPart.matches("true|false") || // Is a boolean
                                    nextPart.matches("Pending|Verified")) { // Is a status
                                    break;
                                }
                                fullUrl.append(",").append(nextPart);
                                currentIndex++;
                            }
                        } catch (IllegalArgumentException e) {
                            // Reached the end of the record
                        }
                        imageUrl = fullUrl.toString();
                    }
                    pet.setImageUrl(imageUrl);

                    // Handle description
                    String description = getValueOrDefault(record, "DESCRIPTION", "");
                    if (!description.isEmpty()) {
                        // Try to get the next columns until we find a non-description part
                        StringBuilder fullDesc = new StringBuilder(description);
                        int currentIndex = 10; // DESCRIPTION is at index 10
                        try {
                            while (true) {
                                String nextPart = record.get(currentIndex + 1);
                                if (nextPart.matches("\\d+") || // Is a number
                                    nextPart.matches("true|false") || // Is a boolean
                                    nextPart.matches("Pending|Verified")) { // Is a status
                                    break;
                                }
                                fullDesc.append(",").append(nextPart);
                                currentIndex++;
                            }
                        } catch (IllegalArgumentException e) {
                            // Reached the end of the record
                        }
                        description = fullDesc.toString();
                    }
                    pet.setDescription(description);

                    // Set other fields
                    try {
                        pet.setAdoptionCenterId(Long.parseLong(getValueOrDefault(record, "ADOPTION_CENTER_ID", "0")));
                    } catch (NumberFormatException e) {
                        pet.setAdoptionCenterId(0L);
                    }

                    pet.setStatus(getValueOrDefault(record, "STATUS", "Pending"));

                    try {
                        pet.setAvailable(Boolean.parseBoolean(getValueOrDefault(record, "AVAILABLE", "true")));
                    } catch (Exception e) {
                        pet.setAvailable(true);
                    }

                    pets.add(pet);
                } catch (Exception e) {
                    System.err.println("Warning: Failed to parse record " + record.toString() + " due to: " + e.getMessage());
                }
            }
        }
        return petRepository.saveAll(pets);
    }

    private String getValueOrDefault(CSVRecord record, String header, String defaultValue) {
        try {
            return record.get(header);
        } catch (IllegalArgumentException e) {
            System.out.println("Warning: Column '" + header + "' not found, using default value: " + defaultValue);
            return defaultValue;
        }
    }

    private int getIntValueOrDefault(CSVRecord record, String header, int defaultValue) {
        try {
            String value = record.get(header);
            return value.isEmpty() ? defaultValue : Integer.parseInt(value);
        } catch (Exception e) {
            System.out.println("Warning: Could not parse integer for column '" + header + "', using default value: " + defaultValue);
            return defaultValue;
        }
    }

    private long getLongValueOrDefault(CSVRecord record, String header, long defaultValue) {
        try {
            String value = record.get(header);
            return value.isEmpty() ? defaultValue : Long.parseLong(value);
        } catch (Exception e) {
            System.out.println("Warning: Could not parse long for column '" + header + "', using default value: " + defaultValue);
            return defaultValue;
        }
    }

    private boolean getBooleanValueOrDefault(CSVRecord record, String header, boolean defaultValue) {
        try {
            String value = record.get(header);
            return value.isEmpty() ? defaultValue : Boolean.parseBoolean(value);
        } catch (Exception e) {
            System.out.println("Warning: Could not parse boolean for column '" + header + "', using default value: " + defaultValue);
            return defaultValue;
        }
    }

    public void deleteAllPets() {
        petRepository.deleteAll();      // ← inherited from JpaRepository
    }
}