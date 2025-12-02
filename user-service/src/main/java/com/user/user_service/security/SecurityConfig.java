package com.user.user_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtHeaderFilter jwtHeaderFilter;

    public SecurityConfig(JwtHeaderFilter jwtHeaderFilter) {
        this.jwtHeaderFilter = jwtHeaderFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // API Auth công khai thì cho qua
                        .requestMatchers("/auth/**").permitAll()
                        // Các API khác bắt buộc phải có thông tin User (từ Gateway gửi sang)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtHeaderFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
