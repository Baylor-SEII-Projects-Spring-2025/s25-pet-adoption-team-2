package petadoption.api.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import petadoption.api.pet.Pet;


import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Optional<User> findUser(Long userId) {
        return userRepository.findById(userId);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> findUserByUserType(String userType) {
        return userRepository.findByUserType(userType);
    }
    public User updatePreferencesAfterRating(User user, Pet pet, double rating) {
        // making a learning rate so I can tune it later
        double learningRate = 0.1;

        // nudging preference towards pet's age
        if (user.getTargetAge() != null) {
            int newTargetAge = (int) Math.round((1 - learningRate) * user.getTargetAge() + learningRate * pet.getAge());
            user.setTargetAge(newTargetAge);
        } else {
            user.setTargetAge(pet.getAge());
        }

        // similarly doing the weight
        if (user.getTargetWeight() != null) {
            int newTargetWeight = (int) Math.round((1 - learningRate) * user.getTargetWeight() + learningRate * pet.getWeight());
            user.setTargetWeight(newTargetWeight);
        } else {
            user.setTargetWeight(pet.getWeight());
        }

        // these are kind of discrete so if they rate them high enough, they get a new fav
        if (rating >= 4) {
            user.setPreferredSpecies(pet.getSpecies());
            user.setPreferredGender(pet.getGender());
            user.setPreferredBreed(pet.getBreed());
            user.setPreferredCoatLength(pet.getCoatLength());
            user.setPreferredHealthStatus(pet.getHealthStatus());
        }

        return userRepository.save(user);
    }
}
