package petadoption.api.notifications;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import petadoption.api.user.User;
import petadoption.api.user.UserRepository;

@Component
public class DataInitializer {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void initAdoptionCenterAccount() {
        boolean exists = userRepository.existsByUserType("SHELTER");
        if (!exists) {
            User adoptionCenter = new User();
            adoptionCenter.setEmailAddress("shelter@example.com");
            adoptionCenter.setUserType("SHELTER");

            userRepository.save(adoptionCenter);
        }
    }
}
