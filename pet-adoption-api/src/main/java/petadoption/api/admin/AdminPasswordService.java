package petadoption.api.admin;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AdminPasswordService {

    @Autowired
    private AdminPasswordRepository adminPasswordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initDefaultPassword() {
        ensureDefaultPasswordExists();
    }

    /**
     * Checks if the provided admin password is valid
     */
    public boolean isValidAdminPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            return false;
        }
        return adminPasswordRepository.existsByPasswordAndActiveIsTrue(password);
    }

    /**
     * Creates a default admin password if none exists
     */
    public void ensureDefaultPasswordExists() {
        if (adminPasswordRepository.count() == 0) {
            AdminPassword defaultPassword = new AdminPassword();
            defaultPassword.setPassword("admin123");
            defaultPassword.setDescription("Default admin password - please change");
            defaultPassword.setActive(true);
            adminPasswordRepository.save(defaultPassword);
        }
    }
}