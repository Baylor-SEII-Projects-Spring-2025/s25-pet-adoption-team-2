package petadoption.api.pet;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
// Import Value annotation to read from properties
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.persistence.EntityNotFoundException;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional; // Import Optional
import java.util.UUID; // For more unique filenames

/**
 * Service layer handling business logic for Pet entities,
 * including CRUD operations, image storage to an external path, and CSV imports.
 */
@Service
public class PetService {

    private static final Logger log = LoggerFactory.getLogger(PetService.class);

    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Value("${pet.upload.base-path:./pet-uploads}")
    private String uploadBasePath;

    private final String imageSubDir = "images";

    @Autowired
    public PetService(PetRepository petRepository,UserRepository userRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;

        log.info("Pet upload base path configured as: {}", uploadBasePath);

    }

    /**
     * Adds a new pet to the system. Sets default status and availability.
     * Ensures adopterId is null for new pets.
     * @param pet The Pet object to add. Must have required fields like name, adoptionCenterId populated.
     * @return The saved Pet entity.
     * @throws IllegalArgumentException if required fields are missing in the pet object.
     * @throws RuntimeException if there's a database error during saving.
     */
    @Transactional
    public Pet addPet(Pet pet) {

        if (pet == null || pet.getName() == null || pet.getName().trim().isEmpty() || pet.getAdoptionCenterId() == null) {
            throw new IllegalArgumentException("Pet name and adoptionCenterId are required to add a pet.");
        }


        if (pet.getStatus() == null || pet.getStatus().trim().isEmpty()) {
            pet.setStatus("Pending");
        }
        if (pet.getAvailable() == null) {
            pet.setAvailable(true);
        }
        pet.setAdopterId(null);

        log.info("Adding new pet '{}' for shelter ID {}", pet.getName(), pet.getAdoptionCenterId());
        try {
            return petRepository.save(pet);
        } catch (Exception e) {
            log.error("Database error while saving new pet '{}': {}", pet.getName(), e.getMessage(), e);
            throw new RuntimeException("Failed to save pet to database.", e);
        }
    }

    /**
     * Ensures the upload directories exist.
     * @throws IOException if directories cannot be created
     */
    private void ensureDirectoriesExist() throws IOException {
        if (uploadBasePath == null || uploadBasePath.trim().isEmpty()) {
            uploadBasePath = "./pet-uploads";
            log.warn("Upload base path is null or empty, using default: {}", uploadBasePath);
        }

        File baseDir = new File(uploadBasePath);
        File imageDir = new File(baseDir, imageSubDir);

        if (!baseDir.exists()) {
            if (baseDir.mkdirs()) {
                log.info("Created base upload directory: {}", baseDir.getAbsolutePath());
            } else {
                throw new IOException("Failed to create base upload directory: " + baseDir.getAbsolutePath());
            }
        }

        if (!imageDir.exists()) {
            if (imageDir.mkdirs()) {
                log.info("Created image upload directory: {}", imageDir.getAbsolutePath());
            } else {
                throw new IOException("Failed to create image upload directory: " + imageDir.getAbsolutePath());
            }
        }

        if (!baseDir.canWrite()) {
            log.warn("Base upload directory is not writable: {}", baseDir.getAbsolutePath());
        }

        if (!imageDir.canWrite()) {
            log.warn("Image upload directory is not writable: {}", imageDir.getAbsolutePath());
        }
    }

    /**
     * Stores an uploaded image file in the configured external directory.
     * Creates the directory structure if it doesn't exist.
     * Generates a unique filename to avoid collisions.
     * @param file The uploaded image file (must not be null or empty).
     * @return The web-accessible URL path for the stored image (e.g., /uploads/images/unique_filename.jpg).
     * @throws IOException If an error occurs during directory creation or file storage.
     * @throws IllegalArgumentException If the provided file is null or empty.
     */
    public String storeImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store null or empty file.");
        }

        ensureDirectoriesExist();

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
        String extension = "";
        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot >= 0) {
            extension = originalFilename.substring(lastDot);
        }
        String baseName = originalFilename.substring(0, lastDot >= 0 ? lastDot : originalFilename.length())
                .replaceAll("[^a-zA-Z0-9.\\-]", "_");
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uniqueFilename = timestamp + "_" + baseName + extension;

        File imageDir = new File(uploadBasePath, imageSubDir);
        File targetFile = new File(imageDir, uniqueFilename);

        try {
            Files.copy(file.getInputStream(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored image {} at path {}", uniqueFilename, targetFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("Could not save uploaded file {} to path {}: {}", uniqueFilename, targetFile.getAbsolutePath(), e.getMessage(), e);
            throw new IOException("Failed to save image file to storage: " + uniqueFilename, e);
        }

        return "/uploads/" + imageSubDir + "/" + uniqueFilename;
    }

    /**
     * Retrieves a paginated list of pets that are currently available for adoption.
     * @param pageable Pagination and sorting information.
     * @return A Page containing available Pet entities.
     */
    @Transactional(readOnly = true) // Read-only transaction optimization
    public Page<Pet> getAllAvailablePets(Pageable pageable) {
        log.info("Fetching available pets - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return petRepository.findByAvailableTrue(pageable);
    }

    /**
     * Retrieves a list of pets adopted by a specific user.
     * @param adopterId The ID of the adopter user.
     * @return A List of Pet entities adopted by the user. Returns empty list if adopterId is null.
     */
    @Transactional(readOnly = true)
    public List<Pet> getPetsByAdopter(Long adopterId) {
        if (adopterId == null) {
            log.warn("Attempted to fetch adopted pets with null adopter ID.");
            return List.of(); // Return empty list
        }
        log.info("Fetching pets adopted by user ID: {}", adopterId);
        return petRepository.findByAdopterId(adopterId);
    }

    /**
     * Retrieves a list of pets listed by a specific shelter.
     * @param shelterId The ID of the shelter user.
     * @return A List of Pet entities listed by the shelter. Returns empty list if shelterId is null.
     */
    @Transactional(readOnly = true)
    public List<Pet> getPetsByShelter(Long shelterId) {
        if (shelterId == null) {
            log.warn("Attempted to fetch shelter pets with null shelter ID.");
            return List.of();
        }
        log.info("Fetching pets listed by shelter ID: {}", shelterId);
        return petRepository.findByAdoptionCenterId(shelterId);
    }

    /**
     * Imports pets from a CSV file located in the classpath resources.
     * @return A list of the imported and saved Pet entities.
     * @throws IOException If the CSV file cannot be read or found.
     */
    @Transactional
    public List<Pet> importPetsFromCSV() throws IOException {
        List<Pet> pets = new ArrayList<>();
        String csvResourcePath = "data/MOCK_DATA (3).csv";
        Resource resource = new ClassPathResource(csvResourcePath);

        if (!resource.exists()) {
            log.error("CSV resource file not found at path: {}", csvResourcePath);
            throw new IOException("CSV resource file not found: " + csvResourcePath);
        }

        log.info("Starting import from CSV resource: {}", csvResourcePath);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build();
            Iterable<CSVRecord> records = csvFormat.parse(reader);

            int recordCount = 0;
            for (CSVRecord record : records) {
                recordCount++;
                try {
                    Pet pet = parsePetFromCsvRecord(record);
                    if (pet.getAdoptionCenterId() != null) {
                        pets.add(pet);
                    } else {
                        log.warn("Skipping pet '{}' from CSV due to missing or invalid adoption center ID.", pet.getName());
                    }
                } catch (Exception e) {
                    log.warn("Skipping record #{} during CSV import due to error: {} - Record: {}", recordCount, e.getMessage(), record.toString());
                }
            }
            log.info("Parsed {} records from CSV. Saving {} valid pets.", recordCount, pets.size());
        }
        if (!pets.isEmpty()) {
            return petRepository.saveAll(pets);
        } else {
            return List.of();
        }
    }

    /**
     * Imports pets from CSV data provided as a String.
     * @param csvData The CSV content as a String.
     * @return A list of the imported and saved Pet entities.
     * @throws IOException If an error occurs during parsing.
     */
    @Transactional
    public List<Pet> importPetsFromCSVData(String csvData) throws IOException {
        List<Pet> pets = new ArrayList<>();
        log.info("Starting import from CSV data string.");
        if (csvData == null || csvData.trim().isEmpty()) {
            log.warn("Attempted to import from empty CSV data string.");
            return pets;
        }
        try (BufferedReader reader = new BufferedReader(new java.io.StringReader(csvData))) {
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build();
            Iterable<CSVRecord> records = csvFormat.parse(reader);

            int recordCount = 0;
            for (CSVRecord record : records) {
                recordCount++;
                try {
                    Pet pet = parsePetFromCsvRecord(record);
                    if (pet.getAdoptionCenterId() != null) {
                        pets.add(pet);
                    } else {
                        log.warn("Skipping pet '{}' from CSV data due to missing or invalid adoption center ID.", pet.getName());
                    }
                } catch (Exception e) {
                    log.warn("Skipping record #{} during CSV data import due to error: {} - Record: {}", recordCount, e.getMessage(), record.toString());
                }
            }
            log.info("Parsed {} records from CSV data. Saving {} valid pets.", recordCount, pets.size());
        }
        if (!pets.isEmpty()) {
            return petRepository.saveAll(pets);
        } else {
            return List.of();
        }
    }

    /**
     * Helper method to parse a single CSVRecord into a Pet object.
     * Handles potential missing columns and type conversion errors.
     * Sets appropriate defaults for imported pets.
     * @param record The CSVRecord to parse.
     * @return A Pet object populated from the record.
     */
    private Pet parsePetFromCsvRecord(CSVRecord record) {
        Pet pet = new Pet();
        pet.setName(getValueOrDefault(record, "NAME", "Unnamed Pet"));
        pet.setAge(getIntValueOrDefault(record, "AGE", 0));
        pet.setSpecies(getValueOrDefault(record, "SPECIES", "Unknown"));
        pet.setBreed(getValueOrDefault(record, "BREED", "Unknown"));
        pet.setGender(getValueOrDefault(record, "GENDER", "Unknown"));
        pet.setHealthStatus(getValueOrDefault(record, "HEALTH_STATUS", "Unknown"));
        pet.setWeight(getIntValueOrDefault(record, "WEIGHT", 0));
        pet.setCoatLength(getValueOrDefault(record, "COAT_LENGTH", null)); // Allow null
        pet.setImageUrl(getValueOrDefault(record, "IMAGE_URL", null)); // Allow null
        pet.setDescription(getValueOrDefault(record, "DESCRIPTION", "")); // Default to empty string
        pet.setAdoptionCenterId(getLongValueOrDefault(record, "adoption_center_id", null));

        pet.setStatus(getValueOrDefault(record, "STATUS", "Available")); // Default to Available
        pet.setAvailable(getBooleanValueOrDefault(record, "AVAILABLE", true)); // Default to true
        pet.setAdopterId(null);

        return pet;
    }

    /**
     * Deletes all pets from the database. Use with extreme caution. Requires appropriate authorization.
     */
    @Transactional
    public void deleteAllPets() {
        long count = petRepository.count();
        log.warn("Executing DELETE ALL PETS operation. {} pets will be deleted.", count);
        petRepository.deleteAll();
        log.info("Successfully deleted all pets.");
    }

    /**
     * Retrieves a single pet by its ID.
     * @param petId The ID of the pet.
     * @return An Optional containing the Pet if found, or empty otherwise.
     */
    @Transactional(readOnly = true)
    public Optional<Pet> findPetById(Long petId) {
        log.debug("Finding pet by ID: {}", petId);
        return petRepository.findById(petId);
    }

    // --- Helper methods for safe CSV parsing ---
    private String getValueOrDefault(CSVRecord record, String header, String defaultValue) {
        if (!record.isSet(header)) {
            log.trace("CSV header '{}' not found in record.", header);
            return defaultValue;
        }
        try {
            String value = record.get(header);
            return (value == null || value.trim().isEmpty()) ? defaultValue : value.trim();
        } catch (IllegalArgumentException e) {
            log.trace("Error accessing CSV header '{}': {}", header, e.getMessage());
            return defaultValue;
        }
    }

    private Integer getIntValueOrDefault(CSVRecord record, String header, Integer defaultValue) {
        String value = getValueOrDefault(record, header, null);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            log.warn("Could not parse integer for CSV header '{}', value: '{}'. Using default {}.", header, value, defaultValue);
            return defaultValue;
        }
    }

    private Long getLongValueOrDefault(CSVRecord record, String header, Long defaultValue) {
        String value = getValueOrDefault(record, header, null);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            log.warn("Could not parse long for CSV header '{}', value: '{}'. Using default {}.", header, value, defaultValue);
            return defaultValue;
        }
    }

    private Boolean getBooleanValueOrDefault(CSVRecord record, String header, boolean defaultValue) {
        String value = getValueOrDefault(record, header, "");
        if (value.isEmpty()) {
            return defaultValue;
        }
        value = value.toLowerCase();
        return "true".equals(value) || "1".equals(value) || "yes".equals(value) || "t".equals(value) || "y".equals(value);
    }

    /**
     * Gets a paginated list of ALL pets (including unavailable/adopted).
     * Use with caution, prefer `getAllAvailablePets` for public adoption listings.
     * @param pageable Pagination and sorting information.
     * @return A Page of all Pet entities.
     */
    @Transactional(readOnly = true)
    public Page<Pet> getAllPets(Pageable pageable) {
        log.info("Fetching ALL pets (including unavailable) - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return petRepository.findAll(pageable);
    }

    /**
     * Gets a list of ALL pets (including unavailable/adopted). Use with caution.
     * @return A List of all Pet entities.
     */
    @Transactional(readOnly = true)
    public List<Pet> getAllPetsList() {
        log.info("Fetching list of ALL pets (including unavailable)");
        return petRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Pet> getAvailablePetsByLocation(String state, String city, Pageable pageable) {
        List<User> shelters = userRepository.findByUserType("SHELTER");

        List<Long> centerIds = shelters.stream()
                .filter(u -> {
                    String addr = u.getAddress();
                    if (addr == null) return false;
                    boolean stateMatch = (state == null || state.isEmpty())
                            || addr.toLowerCase().endsWith(", " + state.toLowerCase());
                    boolean cityMatch = (city == null || city.isEmpty())
                            || addr.toLowerCase().startsWith(city.toLowerCase() + ", ");
                    return stateMatch && cityMatch;
                })
                .map(User::getId)
                .toList();

        if (centerIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return petRepository.findByAdoptionCenterIdInAndAvailableTrue(centerIds, pageable);
    }

    @Transactional
    public void deletePetById(Long petId) {
        if (!petRepository.existsById(petId)) {
            throw new EntityNotFoundException("Pet not found: " + petId);
        }
        petRepository.deleteById(petId);
    }
}