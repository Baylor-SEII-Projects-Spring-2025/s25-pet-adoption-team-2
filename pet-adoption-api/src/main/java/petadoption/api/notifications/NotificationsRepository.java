package petadoption.api.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationsRepository extends JpaRepository<Notifications, Long> {

    // The original methods - keep these
    List<Notifications> findByUser_Id(Long userId);
    List<Notifications> findByUser_IdAndIsReadFalse(Long userId);
    List<Notifications> findByIsReadFalse();

    // The direct method that may have issues
    List<Notifications> findByUserId(Long userId);
    List<Notifications> findByUserIdAndIsReadFalse(Long userId);

    // Add this custom query to ensure we get ALL notifications for a user
    @Query("SELECT n FROM Notifications n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notifications> findAllByUserIdOrdered(@Param("userId") Long userId);
}