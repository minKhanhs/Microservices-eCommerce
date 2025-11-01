package com.user.user_service.Repo;

import com.user.user_service.Model.Token;
import com.user.user_service.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface TokenRepo extends JpaRepository<Token, UUID> {
    @Transactional
    void deleteAllByUser(User user);

    @Transactional
    void deleteAllByExpiresAtBefore(LocalDateTime now);
    Optional<Token> findByToken(String token);
    List<Token> findAllByUserAndRevokedFalse(User user);
}
