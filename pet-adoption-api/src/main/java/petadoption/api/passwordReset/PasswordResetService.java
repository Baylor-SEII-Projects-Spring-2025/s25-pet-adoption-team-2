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

    @Transactional
    public void processForgotPassword(String email) {
        String token = UUID.randomUUID().toString();

        passwordResetTokenRepository.deleteByUserEmail(email);

        User user = userRepository.findByEmailAddress(email);
        if (user == null) {
            return;
        }

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusHours(24)); // Token expires in 24 hours
        passwordResetTokenRepository.save(passwordResetToken);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        mailService.sendPasswordResetEmail(user.getEmailAddress(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> optionalToken = passwordResetTokenRepository.findByToken(token);
        if (optionalToken.isEmpty() || optionalToken.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid token");
        }

        String email = optionalToken.get().getUser().getEmailAddress();
        userService.updatePassword(email, newPassword);

        passwordResetTokenRepository.delete(optionalToken.get());
    }
} 