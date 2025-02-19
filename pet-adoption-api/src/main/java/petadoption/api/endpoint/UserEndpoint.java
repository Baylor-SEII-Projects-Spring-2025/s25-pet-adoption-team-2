package petadoption.api.endpoint;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import petadoption.api.user.LoginRequest;
import petadoption.api.user.User;
import petadoption.api.user.UserService;

@Log4j2
@RestController
public class UserEndpoint {
    @Autowired
    private UserService userService;

    @GetMapping("/users/{id}")
    public User findUserById(@PathVariable Long id) {
        var user = userService.findUser(id).orElse(null);

        if (user == null) {
            log.warn("User not found");
        }

        return user;
    }

    @PostMapping("/users")
    public User saveUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    // New login endpoint
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        // Manipulate the data: Convert email to lowercase and log the password length
        String manipulatedEmail = email.toLowerCase();

        log.info("Login attempt with email: {}", manipulatedEmail);
        log.info("Password: {}", password);

        return String.format("Processed email: %s with password: %s", manipulatedEmail, password);
    }
}
