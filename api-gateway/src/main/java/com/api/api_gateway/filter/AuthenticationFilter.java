package com.api.api_gateway.filter;

import com.api.api_gateway.util.JwtUtil;
import jakarta.ws.rs.core.HttpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            // 1. Kiểm tra xem route này có cần bảo mật không
            if (validator.isSecured.test(exchange.getRequest())) {

                // 2. Kiểm tra xem header có chứa Token không
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    throw new RuntimeException("Missing authorization header");
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7); // Cắt bỏ chữ "Bearer "
                }

                try {
                    // 1. Validate Token
                    jwtUtil.validateToken(authHeader);

                    // 2. Lấy Username và Role từ Token
                    String username = jwtUtil.extractUsername(authHeader);
                    String role = jwtUtil.extractRole(authHeader);

                    // 3. Gắn vào Header để truyền xuống dưới
                    ServerHttpRequest request = exchange.getRequest()
                            .mutate()
                            .header("loggedInUser", username)
                            .header("X-Role", role)
                            .build();

                    return chain.filter(exchange.mutate().request(request).build());
                } catch (Exception e) {
                    System.out.println("Invalid access...!");
                    throw new RuntimeException("Unauthorized access to application");
                }
            }
            return chain.filter(exchange);
        });
    }

    public static class Config {
    }
}
