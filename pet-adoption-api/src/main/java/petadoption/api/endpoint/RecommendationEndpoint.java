// src/main/java/petadoption/endpoint/RecommendationController.java
package petadoption.api.endpoint;

import petadoption.api.pet.Pet;
import petadoption.api.recommendation.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;



@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:3001")
public class RecommendationEndpoint {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Pet>> getRecommendations(@PathVariable Long userId) {
        List<Pet> recommendations = recommendationService.getRecommendationsForUser(userId);
        return ResponseEntity.ok(recommendations);
    }
}
