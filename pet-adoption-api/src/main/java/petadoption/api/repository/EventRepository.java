package petadoption.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import petadoption.api.events.Events;

@Repository
public interface EventRepository extends JpaRepository<Events, Long> {
}
