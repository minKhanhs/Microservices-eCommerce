package com.user.user_service.Repo;

import com.user.user_service.Model.Role;
import com.user.user_service.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);
    Page<User> findAllByRole(Role role, Pageable pageable);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
