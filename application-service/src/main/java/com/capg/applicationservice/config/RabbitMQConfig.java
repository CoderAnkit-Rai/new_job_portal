package com.capg.applicationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE        = "jobportal.exchange";
    public static final String JOB_APPLIED_KEY = "job.applied";

    @Bean
    public TopicExchange jobportalExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue jobAppliedNotifyQueue() {
        return QueueBuilder.durable("job.applied.notify.queue").build();
    }

    @Bean
    public Binding jobAppliedNotifyBinding() {
        return BindingBuilder.bind(jobAppliedNotifyQueue()).to(jobportalExchange()).with(JOB_APPLIED_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
