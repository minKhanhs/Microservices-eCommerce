package com.user.user_service.Controller;

import com.user.user_service.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/user/admin")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserRepo userRepository;


    @GetMapping("/total")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getTotalUsers() {
        return ResponseEntity.ok(userRepository.count());
    }


    @GetMapping("/new-this-month")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getNewUsersThisMonth() {
        LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = LocalDateTime.now();
        return ResponseEntity.ok(userRepository.countByCreatedAtBetween(start, end));
    }
}
