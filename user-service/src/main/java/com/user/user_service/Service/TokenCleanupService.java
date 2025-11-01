package com.user.user_service.Service;

import com.user.user_service.Repo.TokenRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private final TokenRepo tokenRepository;

    // Chạy mỗi ngày lúc 3h sáng
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanExpiredTokens() {
        int before = tokenRepository.findAll().size();
        tokenRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
        int after = tokenRepository.findAll().size();
        System.out.println("Token cleanup done. Before: " + before + ", After: " + after);
    }
}
