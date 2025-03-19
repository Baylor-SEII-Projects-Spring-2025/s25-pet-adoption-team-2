package petadoption.api.recommendation;

public class PetRecommendation {
    private Long id;
    private String imageUrl;
    private String description;
    private Double rating;

    public PetRecommendation() {}

    public PetRecommendation(Long id, String imageUrl, String description, Double rating) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.description = description;
        this.rating = rating;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}