package com.capg.gateway.filter;

import com.capg.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthFilter implements GlobalFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();

        // PUBLIC ENDPOINTS
        if (path.startsWith("/api/users/login") ||
            path.startsWith("/api/users/register") ||
            path.startsWith("/swagger-ui") ||
            path.startsWith("/v3/api-docs") ||
            path.contains("/v3/api-docs") ||
            path.startsWith("/webjars")) {
            return chain.filter(exchange);
        }

        //  AUTH HEADER VALIDATION
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        //  EXTRACT USER DETAILS
        String email = jwtUtil.extractEmail(token);
        String role = jwtUtil.extractRole(token);

        //  ROLE-BASED ACCESS CONTROL

        // all authenticated users → view own profile
        if (path.equals("/api/users/me") && method.equals("GET")
                && !role.equals("JOB_SEEKER") && !role.equals("RECRUITER") && !role.equals("ADMIN")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // all authenticated users → get user by id
        if (path.matches("/api/users/\\d+") && method.equals("GET")
                && !role.equals("JOB_SEEKER") && !role.equals("RECRUITER") && !role.equals("ADMIN")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // all authenticated users → update own profile (ownership checked in service)
        if (path.matches("/api/users/\\d+") && method.equals("PUT")
                && !role.equals("JOB_SEEKER") && !role.equals("RECRUITER") && !role.equals("ADMIN")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // RECRUITER, ADMIN → get user by email
        if (path.matches("/api/users/by-email/.+") && method.equals("GET")
                && !role.equals("RECRUITER") && !role.equals("ADMIN")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // RECRUITER only → create job
        if (path.equals("/api/jobs") && method.equals("POST")
                && !role.equals("RECRUITER")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // RECRUITER only → close job
        if (path.matches("/api/jobs/\\d+/close") && method.equals("PUT")
                && !role.equals("RECRUITER")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // RECRUITER only → edit job
        if (path.matches("/api/jobs/\\d+") && method.equals("PUT")
                && !role.equals("RECRUITER")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // JOB_SEEKER, RECRUITER, ADMIN → read jobs
        if (path.startsWith("/api/jobs") && method.equals("GET")
                && !role.equals("JOB_SEEKER") && !role.equals("RECRUITER") && !role.equals("ADMIN")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // JOB_SEEKER only → apply for job
        if (path.equals("/api/applications") && method.equals("POST")
                && !role.equals("JOB_SEEKER")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // JOB_SEEKER only → view own applications
        if (path.equals("/api/applications/me") && method.equals("GET")
                && !role.equals("JOB_SEEKER")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // RECRUITER only → view applicants for a job
        if (path.startsWith("/api/applications/job") && method.equals("GET")
                && !role.equals("RECRUITER")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // JOB_SEEKER only → withdraw application
        if (path.matches("/api/applications/[^/]+") && method.equals("DELETE")
                && !role.equals("JOB_SEEKER")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // RECRUITER only → update application status
        if (path.matches("/api/applications/[^/]+/status") && method.equals("PUT")
                && !role.equals("RECRUITER")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        //  ADMIN only endpoints (optional future use)
        if (path.startsWith("/api/admin") && !role.equals("ADMIN")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // JOB_SEEKER, RECRUITER, ADMIN → search jobs
        if (path.startsWith("/search") && method.equals("GET")
                && !role.equals("JOB_SEEKER") && !role.equals("RECRUITER") && !role.equals("ADMIN")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        //  ADD HEADERS TO DOWNSTREAM
        ServerWebExchange modifiedExchange = exchange.mutate()
                .request(r -> r
                        .header("X-User-Email", email)
                        .header("X-User-Role", role)
                )
                .build();

        return chain.filter(modifiedExchange);
    }
}