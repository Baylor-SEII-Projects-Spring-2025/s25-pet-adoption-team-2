package petadoption.api.recommendation;

// src/main/java/petadoption/service/RecommendationService.java

import petadoption.api.pet.Pet;
import petadoption.api.pet.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import petadoption.api.user.User;
import petadoption.api.user.UserRepository;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import java.util.List;

@Service
public class RecommendationService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Pet> getRecommendationsForUser(Long userId) {
        // get the user's preferences
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();

        List<Pet> pets = petRepository.findAll();

        // Software 1 type sorting haha
        return pets.stream()
                .sorted(Comparator.comparingDouble((Pet pet) -> -calculateScore(pet, user)))
                .collect(Collectors.toList());
    }

    private double calculateScore(Pet pet, User user) {
        double score = 0.0;

        // Lots of points if preferred species!
        if (user.getPreferredSpecies() != null && !user.getPreferredSpecies().equalsIgnoreCase("Any")) {
            if (user.getPreferredSpecies().equalsIgnoreCase(pet.getSpecies())) {
                score += 50;
            }
            else {
                // adding some randomness so the user has a chance to change their mind about species
                Random random = new Random();
                double randomDouble = random.nextDouble(); // between 0.0 and 1.0
                randomDouble *= 60;
                score += randomDouble;
            }
        } else {
            score += 25; // decided on 25 as the neutral bonus
        }

        // points for preferred age
        if (user.getTargetAge() != null && user.getAgeTolerance() != null) {
            int ageDiff = Math.abs(pet.getAge() - user.getTargetAge());
            // decided to do fractions and stuff with max 30 points to account for tolerances
            double ageScore = Math.max(0, 30 - (ageDiff / (double) user.getAgeTolerance()) * 30);
            score += ageScore;
        }

        // points for weight preferencce
        if (user.getTargetWeight() != null && user.getWeightTolerance() != null) {
            int weightDiff = Math.abs(pet.getWeight() - user.getTargetWeight());
            // similar to age
            double weightScore = Math.max(0, 20 - (weightDiff / (double) user.getWeightTolerance()) * 20);
            score += weightScore;
        }

        // points for gender
        if (user.getPreferredGender() != null && !user.getPreferredGender().equalsIgnoreCase("Any")) {
            if (user.getPreferredGender().equalsIgnoreCase(pet.getGender())) {
                score += 10;
            }
        } else {
            score += 5; // neutral bonus
        }

        // points for breed
        if (user.getPreferredBreed() != null && !user.getPreferredBreed().isEmpty()) {
            if (pet.getBreed() != null && pet.getBreed().equalsIgnoreCase(user.getPreferredBreed())) {
                score += 20;
            }
        }

        // points for coat length
        if (user.getPreferredCoatLength() != null && !user.getPreferredCoatLength().isEmpty()) {
            if (pet.getCoatLength() != null && pet.getCoatLength().equalsIgnoreCase(user.getPreferredCoatLength())) {
                score += 10;
            }
        }

        // points for health status
        // decided to allow user to prefer sickly animals but idk how I feel about that
        if (user.getPreferredHealthStatus() != null && !user.getPreferredHealthStatus().isEmpty()) {
            if (pet.getHealthStatus() != null && pet.getHealthStatus().equalsIgnoreCase(user.getPreferredHealthStatus())) {
                score += 5;
            }
        }

        return score;
    }
}

