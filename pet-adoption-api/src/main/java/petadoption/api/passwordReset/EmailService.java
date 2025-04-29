package petadoption.api.passwordReset;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            logger.info("Attempting to send email to: {}", toEmail);
            
            // Create a new message
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("homefurgood25@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - Home Fur Good");
            message.setText(
                "Hello,\n\n" +
                "You have requested to reset your password for your Home Fur Good account.\n\n" +
                "Please click the following link to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Home Fur Good Team");
            
            logger.info("Sending email...");
            
            // Get the actual JavaMailSenderImpl instance
            if (mailSender instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
                logger.info("Using host: {}", mailSenderImpl.getHost());
                logger.info("Using port: {}", mailSenderImpl.getPort());
            }
            
            mailSender.send(message);
            logger.info("Email sent successfully");
        } catch (Exception e) {
            logger.error("Failed to send email: {}", e.getMessage(), e);
            throw e;
        }
    }

} 