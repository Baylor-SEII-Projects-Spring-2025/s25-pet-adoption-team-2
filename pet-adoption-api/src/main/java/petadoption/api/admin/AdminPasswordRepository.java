package petadoption.api.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminPasswordRepository extends JpaRepository<AdminPassword, Long> {
    boolean existsByPasswordAndActiveIsTrue(String password);
    Optional<AdminPassword> findByPasswordAndActiveIsTrue(String password);
}