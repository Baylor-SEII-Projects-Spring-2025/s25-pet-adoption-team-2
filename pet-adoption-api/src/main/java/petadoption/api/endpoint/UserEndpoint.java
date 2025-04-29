package petadoption.api.endpoint;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import petadoption.api.pet.PetRepository;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;
import petadoption.api.user.UserService;
import petadoption.api.pet.Pet;
import petadoption.api.util.JwtUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Log4j2
@RestController
public class UserEndpoint {
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private PetRepository petRepository;

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
            String idStr = updateRequest.get("id");
            String newEmail = updateRequest.get("email");

            if (idStr == null || newEmail == null) {
                log.warn("Update email request missing user id or email");
                return ResponseEntity.badRequest().body(Map.of("error", "User ID and new email are required"));
            }

            Long id = Long.parseLong(idStr);

            var userOpt = userService.findUser(id);
            if (userOpt.isEmpty()) {
                log.warn("User with id {} not found", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            user.setEmailAddress(newEmail);
            userService.saveUser(user);

            log.info("Updated email for user {} to {}", id, newEmail);

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
            String email = signupRequest.get("email");
            String password = signupRequest.get("password");
            String confirmPassword = signupRequest.get("confirmPassword");
            String userType = signupRequest.getOrDefault("userType", "ADOPTER");

            String firstName = signupRequest.get("firstName");
            String lastName = signupRequest.get("lastName");
            String phone = signupRequest.get("phone");
            String address = signupRequest.get("address");
            String shelterName = signupRequest.get("shelterName"); // only relevant if userType=SHELTER

            if (!isValidEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
            }

            if (password == null || password.length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
            }

            if (!password.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
            }

            if (userRepository.existsByEmailAddress(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Email already registered"));
            }

            User newUser = new User();
            newUser.setEmailAddress(email);
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setUserType(userType);

            switch (userType) {
                case "SHELTER":
                    if (shelterName == null || shelterName.isEmpty()) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Shelter name is required for shelters"));
                    }
                    newUser.setPhone(phone);
                    newUser.setAddress(address);
                    newUser.setShelterName(shelterName);
                    break;
                case "ADMIN":
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setPhone(phone);
                    newUser.setAddress(address);
                    break;
                default:
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setPhone(phone);
                    newUser.setAddress(address);
                    break;
            }

            User savedUser = userService.saveUser(newUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User created successfully");
            response.put("userId", savedUser.getId());
            response.put("email", savedUser.getEmailAddress());
            response.put("userType", savedUser.getUserType());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Error creating user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
    }

    @PutMapping("/api/user/rate")
    public ResponseEntity<?> updateUserRating(@RequestBody Map<String, String> request) {
        try {
            // getting the parameters
            String userIdStr = request.get("userId");
            String petIdStr = request.get("petId");
            String ratingStr = request.get("rating");

            if (userIdStr == null || petIdStr == null || ratingStr == null) {
                log.warn("Rate request missing one or more required fields: userId, petId, rating");
                return ResponseEntity.badRequest().body(Map.of("error", "userId, petId, and rating are required"));
            }

            Long userId = Long.parseLong(userIdStr);
            Long petId = Long.parseLong(petIdStr);
            double rating = Double.parseDouble(ratingStr);

            // getting the user
            Optional<User> userOpt = userService.findUser(userId);
            if (userOpt.isEmpty()) {
                log.warn("User with id {} not found", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }
            User user = userOpt.get();

            // getting the pet
            Optional<Pet> petOpt = petRepository.findById(petId);
            if (petOpt.isEmpty()) {
                log.warn("Pet with id {} not found", petId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Pet not found"));
            }
            Pet pet = petOpt.get();

            // this method does all the actual work
            User updatedUser = userService.updatePreferencesAfterRating(user, pet, rating);

            log.info("Updated preferences for user {} after rating pet {} with rating {}", userId, petId, rating);

            // returning the updated user
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User preferences updated successfully");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating user rating/preferences", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update preferences: " + e.getMessage()));
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
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            if (email == null || password == null) {
                log.warn("Login attempt with missing email or password");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email and password are required"));
            }

            // Find the user by email
            User user = userRepository.findByEmailAddress(email);

            if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
                log.warn("Failed login attempt for email: {}", email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
            }

            // Generate the JWT token
            String token = jwtUtil.generateToken(user.getEmailAddress());

            log.info("User logged in successfully: {}", email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("userId", user.getId());
            response.put("email", user.getEmailAddress());
            response.put("userType", user.getUserType());
            response.put("token", token);  // Include the JWT token in the response

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PutMapping("/api/user")
    public ResponseEntity<?> updateUser(@RequestBody Map<String, Object> updateRequest) {
        try {
            Object idObj = updateRequest.get("id");
            if (idObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            Long userId = Long.parseLong(idObj.toString());

            Optional<User> userOpt = userService.findUser(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }
            User user = userOpt.get();

            switch (user.getUserType()) {
                case "SHELTER":
                    if (updateRequest.containsKey("phone")) {
                        user.setPhone(updateRequest.get("phone").toString());
                    }
                    if (updateRequest.containsKey("address")) {
                        user.setAddress(updateRequest.get("address").toString());
                    }
                    if (updateRequest.containsKey("shelterName")) {
                        user.setShelterName(updateRequest.get("shelterName").toString());
                    }
                    break;

                case "ADMIN":
                    if (updateRequest.containsKey("firstName")) {
                        user.setFirstName(updateRequest.get("firstName").toString());
                    }
                    if (updateRequest.containsKey("lastName")) {
                        user.setLastName(updateRequest.get("lastName").toString());
                    }
                    if (updateRequest.containsKey("phone")) {
                        user.setPhone(updateRequest.get("phone").toString());
                    }
                    if (updateRequest.containsKey("address")) {
                        user.setAddress(updateRequest.get("address").toString());
                    }
                    if (updateRequest.containsKey("shelterName")) {
                        user.setShelterName(updateRequest.get("shelterName").toString());
                    }
                    if (updateRequest.containsKey("userType")) {
                        user.setUserType(updateRequest.get("userType").toString());
                    }
                    if (updateRequest.containsKey("password")) {
                        user.setPassword(updateRequest.get("password").toString());
                    }
                    break;

                default:

                    if (updateRequest.containsKey("firstName")) {
                        user.setFirstName(updateRequest.get("firstName").toString());
                    }
                    if (updateRequest.containsKey("lastName")) {
                        user.setLastName(updateRequest.get("lastName").toString());
                    }
                    if (updateRequest.containsKey("phone")) {
                        user.setPhone(updateRequest.get("phone").toString());
                    }
                    if (updateRequest.containsKey("address")) {
                        user.setAddress(updateRequest.get("address").toString());
                    }
                    break;
            }

            if (updateRequest.containsKey("email")) {
                user.setEmailAddress(updateRequest.get("email").toString());
            }

            userService.saveUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User updated successfully");
            response.put("userId", user.getId());
            response.put("email", user.getEmailAddress());
            response.put("userType", user.getUserType());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("phone", user.getPhone());
            response.put("address", user.getAddress());
            response.put("shelterName", user.getShelterName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update user: " + e.getMessage()));
        }
    }

}