package com.capg.jobservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE        = "jobportal.exchange";
    public static final String JOB_CREATED_KEY = "job.created";
    public static final String JOB_CLOSED_KEY  = "job.closed";

    @Bean
    public TopicExchange jobportalExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue jobCreatedNotifyQueue() {
        return QueueBuilder.durable("job.created.notify.queue").build();
    }

    @Bean
    public Queue jobCreatedSearchQueue() {
        return QueueBuilder.durable("job.created.search.queue").build();
    }

    @Bean
    public Queue jobClosedNotifyQueue() {
        return QueueBuilder.durable("job.closed.notify.queue").build();
    }

    @Bean
    public Binding jobCreatedNotifyBinding() {
        return BindingBuilder.bind(jobCreatedNotifyQueue()).to(jobportalExchange()).with(JOB_CREATED_KEY);
    }

    @Bean
    public Binding jobCreatedSearchBinding() {
        return BindingBuilder.bind(jobCreatedSearchQueue()).to(jobportalExchange()).with(JOB_CREATED_KEY);
    }

    @Bean
    public Binding jobClosedNotifyBinding() {
        return BindingBuilder.bind(jobClosedNotifyQueue()).to(jobportalExchange()).with(JOB_CLOSED_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
