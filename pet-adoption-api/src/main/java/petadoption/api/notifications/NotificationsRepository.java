package petadoption.api.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationsRepository extends JpaRepository<Notifications, Long> {


    List<Notifications> findByUser_Id(Long userId);

    List<Notifications> findByUser_IdAndIsReadFalse(Long userId);

    List<Notifications> findByIsReadFalse();
}
