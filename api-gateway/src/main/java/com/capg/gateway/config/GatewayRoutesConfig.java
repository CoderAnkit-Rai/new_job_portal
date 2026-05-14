package com.capg.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Value("${user.service.url:http://user-service:8081}")
    private String userServiceUrl;

    @Value("${job.service.url:http://job-service:8082}")
    private String jobServiceUrl;

    @Value("${application.service.url:http://application-service:8083}")
    private String applicationServiceUrl;

    @Value("${resume.service.url:http://resume-service:8084}")
    private String resumeServiceUrl;

    @Value("${notification.service.url:http://notification-service:8085}")
    private String notificationServiceUrl;

    @Value("${search.service.url:http://search-service:8086}")
    private String searchServiceUrl;

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r.path("/api/users/**").uri(userServiceUrl))
            .route("job-service", r -> r.path("/api/jobs/**").uri(jobServiceUrl))
            .route("application-service", r -> r.path("/api/applications/**").uri(applicationServiceUrl))
            .route("resume-service", r -> r.path("/api/resumes/**").uri(resumeServiceUrl))
            .route("search-service", r -> r.path("/search/**").uri(searchServiceUrl))
            .route("notification-service", r -> r.path("/notifications/**").uri(notificationServiceUrl))
            .build();
    }
}
