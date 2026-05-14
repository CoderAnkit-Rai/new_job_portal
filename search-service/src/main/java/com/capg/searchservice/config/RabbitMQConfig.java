package com.capg.searchservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE          = "jobportal.exchange";
    public static final String JOB_CREATED_QUEUE = "job.created.search.queue";
    public static final String JOB_CLOSED_QUEUE  = "job.closed.search.queue";

    @Bean
    public TopicExchange jobportalExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue jobCreatedQueue() {
        return QueueBuilder.durable(JOB_CREATED_QUEUE).build();
    }

    @Bean
    public Queue jobClosedQueue() {
        return QueueBuilder.durable(JOB_CLOSED_QUEUE).build();
    }

    @Bean
    public Binding jobCreatedBinding() {
        return BindingBuilder.bind(jobCreatedQueue()).to(jobportalExchange()).with("job.created");
    }

    @Bean
    public Binding jobClosedBinding() {
        return BindingBuilder.bind(jobClosedQueue()).to(jobportalExchange()).with("job.closed");
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
