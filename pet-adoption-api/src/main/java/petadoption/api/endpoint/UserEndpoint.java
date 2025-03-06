package petadoption.api.endpoint;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;
import petadoption.api.user.UserService;

import java.util.HashMap;
import java.util.Map;

@Log4j2
@RestController
@CrossOrigin(origins = "*") // Configure appropriately for production
public class UserEndpoint {
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users/{id}")
    public User findUserById(@PathVariable Long id) {
        var user = userService.findUser(id).orElse(null);

        if (user == null) {
            log.warn("User not found");
        }

        return user;
    }

    @PutMapping("/api/user/email")
    public ResponseEntity<?> updateEmail(@RequestBody Map<String, String> updateRequest) {
        try {
            // Extract user id and new email address from the request body
            String idStr = updateRequest.get("id");
            String newEmail = updateRequest.get("email");

            if (idStr == null || newEmail == null) {
                log.warn("Update email request missing user id or email");
                return ResponseEntity.badRequest().body(Map.of("error", "User ID and new email are required"));
            }

            Long id = Long.parseLong(idStr);

            // Find the user using the UserService (which wraps the repository)
            var userOpt = userService.findUser(id);
            if (userOpt.isEmpty()) {
                log.warn("User with id {} not found", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            // Update the user's email address and persist the change
            User user = userOpt.get();
            user.setEmailAddress(newEmail);
            userService.saveUser(user);

            log.info("Updated email for user {} to {}", id, newEmail);

            // Build and return the success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email updated successfully");
            response.put("userId", user.getId());
            response.put("email", user.getEmailAddress());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update email: " + e.getMessage()));
        }
    }


    @PostMapping("/users")
    public User saveUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PostMapping("/api/signup")
    public ResponseEntity<?> signUp(@RequestBody Map<String, String> signupRequest) {
        try {
            // Extract signup details
            String email = signupRequest.get("email");
            String password = signupRequest.get("password");
            String userType = signupRequest.getOrDefault("userType", "ADOPTER"); // Default user type

            // Basic validation
            if (email == null || password == null) {
                log.warn("Signup attempt with missing email or password");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email and password are required"));
            }

            // Check if user already exists
            if (userRepository.existsByEmailAddress(email)) {
                log.warn("Signup attempt with existing email: {}", email);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Email already registered"));
            }

            // Create new user
            User newUser = new User();
            newUser.setEmailAddress(email);
            newUser.setPassword(password); // In production, hash this!
            newUser.setUserType(userType);

            User savedUser = userService.saveUser(newUser);
            log.info("New user created with ID: {}", savedUser.getId());

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User created successfully");
            response.put("userId", savedUser.getId());
            response.put("email", savedUser.getEmailAddress());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Error creating user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }

    @PostMapping("/api/echo")
    public ResponseEntity<?> echo(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null) {
            log.warn("Echo request with missing text");
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Text is required"));
        }

        log.info("Echo request received: {}", text);
        Map<String, Object> response = new HashMap<>();
        response.put("echoedText", text);
        response.put("timestamp", java.time.Instant.now().toString());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            // Extract login credentials
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            // Basic validation
            if (email == null || password == null) {
                log.warn("Login attempt with missing email or password");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email and password are required"));
            }

            // Find user by email
            User user = userRepository.findByEmailAddress(email);

            // Check if user exists and password matches
            if (user == null || !password.equals(user.getPassword())) {
                log.warn("Failed login attempt for email: {}", email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
            }

            // Create success response with user details
            log.info("User logged in successfully: {}", email);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("userId", user.getId());
            response.put("email", user.getEmailAddress());
            response.put("userType", user.getUserType());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }
}