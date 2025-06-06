package petadoption.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import petadoption.api.events.Events;
import petadoption.api.user.User;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Events, Long> {
    List<Events> findByCreatedBy(User createdBy);
    @Query("SELECT e FROM Events e WHERE e.createdBy.id = :userId")
    List<Events> findByCreatedById(Long userId);
}