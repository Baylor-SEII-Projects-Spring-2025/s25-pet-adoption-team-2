package petadoption.api.user;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@SpringJUnitConfig
@ContextConfiguration(classes = {UserTestConfig.class})
public class MinimalUserTest {

    @MockBean
    private UserRepository userRepository;

    @Test
    public void testUserRepositoryMock() {
        // Create a mock user
        User mockUser = new User();
        mockUser.setEmailAddress("test@example.com");
        mockUser.setPassword("password");
        mockUser.setUserType("ADOPTER");

        // Set up the mock repository behavior
        when(userRepository.findByEmailAddress("test@example.com")).thenReturn(mockUser);
        when(userRepository.existsByEmailAddress("test@example.com")).thenReturn(true);

        // Test the mock
        User result = userRepository.findByEmailAddress("test@example.com");
        assertEquals("test@example.com", result.getEmailAddress());
        assertEquals("ADOPTER", result.getUserType());
    }
}