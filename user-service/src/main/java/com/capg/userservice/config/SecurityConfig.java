package com.capg.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // CSRF is disabled intentionally: this service is stateless and uses JWT via API Gateway.
    // All authentication/authorization is handled at the gateway layer (JwtAuthFilter).
    // HTTP Basic and form login are disabled as this is a REST API, not a web app.
    @Bean
    @SuppressWarnings("all") // CSRF disabled by design for stateless JWT REST API
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // NOSONAR: stateless JWT API, no session-based CSRF risk
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
        return http.build();
    }
}