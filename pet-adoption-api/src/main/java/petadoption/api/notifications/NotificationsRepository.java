package petadoption.api.notifications;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationsRepository extends JpaRepository<Notifications, Long> {

    List<Notifications> findByUser_Id(Long userId);
    List<Notifications> findByUser_IdAndIsReadFalse(Long userId);
    List<Notifications> findByIsReadFalse();

    List<Notifications> findByUserId(Long userId);
    List<Notifications> findByUserIdAndIsReadFalse(Long userId);

    @Query("SELECT n FROM Notifications n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notifications> findAllByUserIdOrdered(@Param("userId") Long userId);

    @Transactional
    void deleteBySender_Id(Long senderId);

    @Transactional
    void deleteByUser_Id(Long recipientId);
}