package petadoption.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * Configuration for web-related settings, including static resource handling
 * and mapping upload directories to URL paths.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    @Value("${pet.upload.base-path:./pet-uploads}")
    private String uploadBasePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Handle null or empty path
        if (uploadBasePath == null || uploadBasePath.trim().isEmpty()) {
            uploadBasePath = "./pet-uploads";
            log.warn("Upload base path is null or empty, using default: {}", uploadBasePath);
        }

        // Convert the path for proper resource handling
        File baseDir = new File(uploadBasePath);
        String fileBasePath = baseDir.getAbsolutePath();

        // Ensure path ends with a separator
        if (!fileBasePath.endsWith("/") && !fileBasePath.endsWith("\\")) {
            fileBasePath = fileBasePath + "/";
        }

        // Create the file URL prefix (needs to start with "file:" and end with "/")
        String fileUrlPath = "file:" + fileBasePath;

        log.info("Mapping URL path /uploads/** to file system location: {}", fileUrlPath);

        // Map URL paths to file system location
        // For example, /uploads/images/file.jpg will look for file.jpg in uploadBasePath/images/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(fileUrlPath)
                .setCachePeriod(3600); // Cache for 1 hour (optional)

        // Add specific mapping for images directory
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .setCachePeriod(3600);

        log.info("Mapping URL path /images/** to classpath location: classpath:/static/images/");

        // Keep default resource handlers for static content
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
    }
}