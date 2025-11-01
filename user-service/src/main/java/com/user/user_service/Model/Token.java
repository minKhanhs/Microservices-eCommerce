package com.user.user_service.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Token {

    @Id
    @GeneratedValue
    @Column(name = "token_id", updatable = false, nullable = false)
    private UUID tokenId;

    @Column(nullable = false, unique = true)
    private String token;

    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;

    @Column(name = "is_revoked")
    private boolean revoked;

    // Mỗi token thuộc về một user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}

