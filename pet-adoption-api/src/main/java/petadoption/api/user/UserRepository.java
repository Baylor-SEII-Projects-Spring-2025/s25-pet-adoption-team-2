package petadoption.api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmailAddress(String emailAddress);
    boolean existsByEmailAddress(String emailAddress);
    Optional<User> findByUserType(String userType);


}