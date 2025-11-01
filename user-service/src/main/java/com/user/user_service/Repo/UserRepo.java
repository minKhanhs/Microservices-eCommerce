package com.user.user_service.Repo;

import com.user.user_service.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
