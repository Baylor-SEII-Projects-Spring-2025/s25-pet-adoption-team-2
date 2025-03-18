package petadoption.api.user;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

/**
 * Simple JUnit test class to demonstrate how to test the UserRepository.
 *
 * This uses @DataJpaTest to spin up an in-memory database and load only
 * JPA-related components (i.e., repositories). If you need the full
 * Spring context (services, endpoints, etc.), consider using @SpringBootTest.
 */
@DataJpaTest
class UserTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testCreateAndFindUser() {
        // 1. Create a new user
        User user = new User();
        user.setEmailAddress("test@example.com");
        user.setPassword("secret");
        user.setUserType("ADOPTER");

        // 2. Save user to the in-memory DB
        userRepository.save(user);

        // 3. Verify existence by email
        assertTrue(userRepository.existsByEmailAddress("test@example.com"),
                "User should exist by the given email address");

        // 4. Retrieve user by email
        User found = userRepository.findByEmailAddress("test@example.com");
        assertNotNull(found, "Retrieved user should not be null");

        // 5. Verify fields
        assertEquals("test@example.com", found.getEmailAddress());
        assertEquals("secret", found.getPassword());
        assertEquals("ADOPTER", found.getUserType());
    }
}
