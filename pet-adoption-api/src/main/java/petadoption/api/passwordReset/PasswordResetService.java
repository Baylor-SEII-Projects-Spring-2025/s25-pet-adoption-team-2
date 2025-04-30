package petadoption.api.passwordReset;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;
import petadoption.api.user.UserService;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService mailService;

    @Autowired
    private UserService userService;

    @Transactional(timeout = 5)
    public void processForgotPassword(String email) {
        // First, find the user
        User user = userRepository.findByEmailAddress(email);
        if (user == null) {
            return;
        }

        // Generate new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusHours(24));

        // Delete existing tokens and save new one in a single transaction
        passwordResetTokenRepository.deleteByUserEmail(email);
        passwordResetTokenRepository.save(passwordResetToken);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        mailService.sendPasswordResetEmail(user.getEmailAddress(), resetLink);
    }

    @Transactional(timeout = 5)
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> optionalToken = passwordResetTokenRepository.findByToken(token);
        if (optionalToken.isEmpty() || optionalToken.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid token");
        }

        PasswordResetToken resetToken = optionalToken.get();
        String email = resetToken.getUser().getEmailAddress();
        
        userService.updatePassword(email, newPassword);
        passwordResetTokenRepository.delete(resetToken);
    }
} 