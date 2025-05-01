package petadoption.api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmailAddress(String emailAddress);
    boolean existsByEmailAddress(String emailAddress);
    List<User> findAllByUserType(String userType);
    boolean existsByUserType(String userType);
    List<User> findByUserType(String userType);
    List<User> findByUserTypeNot(String userType);
}