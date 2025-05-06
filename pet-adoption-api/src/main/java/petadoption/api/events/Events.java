package petadoption.api.events;

import jakarta.persistence.*;
import lombok.Data;
import petadoption.api.user.User;

import java.util.List;

@Entity
@Table(name = "events")
public class Events {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;
    private String description;
    private Double rating;
    private String name;
    private String location;
    private String date;
    private String time;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    // Reference to the user who created the event
    @ManyToOne
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    // List of adopters attending the event
    @ManyToMany
    @JoinTable(
        name = "event_attendees",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> attendees;

    // Constructors, getters, and setters

    public Events() {
    }

    public Events(Long id, String imageUrl, String description, Double rating, String name, String location, String date, String time, EventType eventType, User createdBy, List<User> attendees) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.description = description;
        this.rating = rating;
        this.name = name;
        this.location = location;
        this.date = date;
        this.time = time;
        this.eventType = eventType;
        this.createdBy = createdBy;
        this.attendees = attendees;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public List<User> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<User> attendees) {
        this.attendees = attendees;
    }
}