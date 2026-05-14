package com.capg.resumeservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE   = "jobportal.exchange";
    public static final String RESUME_KEY = "resume.uploaded";

    @Bean
    public TopicExchange jobportalExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue resumeNotifyQueue() {
        return QueueBuilder.durable("resume.upload.notify.queue").build();
    }

    @Bean
    public Binding resumeNotifyBinding() {
        return BindingBuilder.bind(resumeNotifyQueue()).to(jobportalExchange()).with(RESUME_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
