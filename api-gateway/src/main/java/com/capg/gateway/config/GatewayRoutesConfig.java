package com.capg.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            // API routes
            .route("user-service", r -> r.path("/api/users/**").uri("lb://user-service"))
            .route("job-service", r -> r.path("/api/jobs/**").uri("lb://job-service"))
            .route("application-service", r -> r.path("/api/applications/**").uri("lb://application-service"))
            .route("notification-service", r -> r.path("/api/notifications/**").uri("lb://notification-service"))
            // Swagger doc routes
            .route("user-service-docs", r -> r.path("/user-service/**")
                .filters(f -> f.stripPrefix(1)).uri("lb://user-service"))
            .route("job-service-docs", r -> r.path("/job-service/**")
                .filters(f -> f.stripPrefix(1)).uri("lb://job-service"))
            .route("application-service-docs", r -> r.path("/application-service/**")
                .filters(f -> f.stripPrefix(1)).uri("lb://application-service"))
            .route("notification-service-docs", r -> r.path("/notification-service/**")
                .filters(f -> f.stripPrefix(1)).uri("lb://notification-service"))
            .build();
    }
}
