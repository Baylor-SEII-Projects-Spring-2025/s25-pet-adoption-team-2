package petadoption.api.events;

public enum EventType {
    PUPPY_YOGA_CLASS("Puppy Yoga Class"),
    ADOPTION_DAY_CARNIVAL("Adoption Day Carnival"),
    PETS_PAINT_NIGHT("Pets & Paint Night"),
    FUR_TASTIC_FASHION_SHOW("Fur-tastic Fashion Show"),
    PET_SPEED_DATING("Pet Speed Dating"),
    TAILGATE_ADOPTION_PARTY("Tailgate Adoption Party"),
    STORYTIME_WITH_PETS("Storytime with Pets"),
    THEMED_ADOPTION_DAYS("Themed Adoption Days"),
    MOVIE_NIGHT_UNDER_THE_STARS("Movie Night Under the Stars"),
    TRICKS_TREATS_TRAINING_WORKSHOP("Tricks & Treats Training Workshop");

    private final String displayName;

    EventType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}