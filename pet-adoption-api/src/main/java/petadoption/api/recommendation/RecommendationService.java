package petadoption.api.recommendation;

// src/main/java/petadoption/service/RecommendationService.java

import petadoption.api.pet.Pet;
import petadoption.api.pet.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    @Autowired
    private PetRepository petRepository;

    public List<Pet> getRecommendationsForUser(Long userId) {
        // Gonna add the actual algorithm in here later
        return petRepository.findAll();
    }
}

