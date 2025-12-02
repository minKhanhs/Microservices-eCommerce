package com.user.user_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtHeaderFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Lấy thông tin Header mà Gateway đã gửi sang
        String username = request.getHeader("loggedInUser");
        String role = request.getHeader("X-Role");

        // 2. Nếu có thông tin -> Nạp vào Security Context của service này
        if (username != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    Collections.singletonList(authority) // Gán quyền cho User
            );

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}