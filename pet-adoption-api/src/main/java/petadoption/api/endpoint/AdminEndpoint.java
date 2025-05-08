package petadoption.api.endpoint;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import petadoption.api.pet.Pet;
import petadoption.api.pet.PetService;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;
import petadoption.api.user.UserService;

import java.util.List;
import java.util.Objects;
import java.util.Map; // Added for error response

@RestController
@RequestMapping("/api/admin")
public class AdminEndpoint {

    private static final Logger log = LoggerFactory.getLogger(AdminEndpoint.class);

    @Autowired
    private PetService petService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    private User getAdminUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            log.trace("Admin check failed: User not authenticated or principal name is null.");
            return null;
        }
        String username = authentication.getName();
        User user = userRepository.findByEmailAddress(username);
        if (user != null && "ADMIN".equals(user.getUserType())) {
            log.trace("Admin check passed for user: {}", username);
            return user;
        } else {
            log.trace("Admin check failed for user: {}. UserType: {}", username, user != null ? user.getUserType() : "Not Found");
            return null;
        }
    }

    @GetMapping("/pets")
    public ResponseEntity<List<Pet>> getAllPetsAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (getAdminUser(authentication) == null) {
            log.warn("Forbidden attempt to get all pets by non-admin user: {}", authentication != null ? authentication.getName() : "unauthenticated");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("ADMIN Request: getAllPetsAdmin");
        try {
            List<Pet> allPets = petService.getAllPetsList();
            return ResponseEntity.ok(allPets);
        } catch (Exception e) {
            log.error("Error fetching all pets for admin: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsersAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User adminUser = getAdminUser(authentication);
        if (adminUser == null) {
            log.warn("Forbidden attempt to get all users by non-admin user: {}", authentication != null ? authentication.getName() : "unauthenticated");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("ADMIN Request: getAllUsersAdmin by user {}", adminUser.getEmailAddress());
        try {
            List<User> allUsers = userRepository.findAll();
            List<User> usersToDisplay = allUsers.stream()
                    .filter(u -> !Objects.equals(u.getId(), adminUser.getId()))
                    .toList();
            return ResponseEntity.ok(usersToDisplay);
        } catch (Exception e) {
            log.error("Error fetching all users for admin: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUserAdmin(@PathVariable Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User adminUser = getAdminUser(authentication);
        if (adminUser == null) {
            log.warn("Forbidden attempt to delete user {} by non-admin user: {}", userId, authentication != null ? authentication.getName() : "unauthenticated");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
        }

        log.info("ADMIN Request: deleteUserAdmin userId={} by admin {}", userId, adminUser.getEmailAddress());

        if (Objects.equals(userId, adminUser.getId())) {
            log.warn("Admin {} attempted self-deletion (ID: {}).", adminUser.getEmailAddress(), userId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Admin cannot delete their own account"));
        }

        try {
            if (!userRepository.existsById(userId)) {
                log.warn("Attempted to delete non-existent user with ID: {}", userId);
                return ResponseEntity.notFound().build();
            }
            userService.deleteUserAndNotifications(userId);
            log.info("Successfully deleted user with ID: {} by admin {}", userId, adminUser.getEmailAddress());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete user"));
        }
    }

    @DeleteMapping("/pets/{petId}")
    public ResponseEntity<?> deletePetAdmin(@PathVariable Long petId) {
        User admin = getAdminUser(SecurityContextHolder.getContext().getAuthentication());
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error","Access denied"));
        }
        try {
            petService.deletePetById(petId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

}