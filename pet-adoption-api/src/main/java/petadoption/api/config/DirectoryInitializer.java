package petadoption.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Component to ensure required directories exist when the application starts.
 * This ensures we don't get runtime errors when trying to upload files.
 */
@Component
public class DirectoryInitializer {

    private static final Logger log = LoggerFactory.getLogger(DirectoryInitializer.class);

    @Value("${pet.upload.base-path:./pet-uploads}")
    private String uploadBasePath;

    /**
     * Initialize required directories when the application is fully started.
     * This runs after all beans are initialized and the application is ready.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initDirectories() {
        log.info("Initializing directories for file uploads...");

        // Create base directory if it doesn't exist
        Path basePath = Paths.get(uploadBasePath);
        if (!Files.exists(basePath)) {
            try {
                Files.createDirectories(basePath);
                log.info("Created base upload directory: {}", basePath.toAbsolutePath());
            } catch (IOException e) {
                log.error("Failed to create base upload directory: {}", basePath.toAbsolutePath(), e);
            }
        } else {
            log.info("Using existing base upload directory: {}", basePath.toAbsolutePath());
        }

        // Create images subdirectory
        Path imagesPath = basePath.resolve("images");
        if (!Files.exists(imagesPath)) {
            try {
                Files.createDirectories(imagesPath);
                log.info("Created images upload directory: {}", imagesPath.toAbsolutePath());
            } catch (IOException e) {
                log.error("Failed to create images upload directory: {}", imagesPath.toAbsolutePath(), e);
            }
        } else {
            log.info("Using existing images upload directory: {}", imagesPath.toAbsolutePath());
        }

        // Verify that the directories are writable
        if (!Files.isWritable(basePath)) {
            log.warn("WARNING: Base upload directory is not writable: {}", basePath.toAbsolutePath());
        }

        if (!Files.isWritable(imagesPath)) {
            log.warn("WARNING: Images upload directory is not writable: {}", imagesPath.toAbsolutePath());
        }

        log.info("Directory initialization completed.");
    }
}