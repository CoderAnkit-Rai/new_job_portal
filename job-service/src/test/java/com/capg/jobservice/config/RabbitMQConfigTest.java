package com.capg.jobservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.*;
import static org.junit.jupiter.api.Assertions.*;

class RabbitMQConfigTest {

    private final RabbitMQConfig config = new RabbitMQConfig();

    @Test void exchangeIsTopicExchange() {
        assertTrue(config.jobportalExchange() instanceof TopicExchange);
        assertEquals(RabbitMQConfig.EXCHANGE, config.jobportalExchange().getName());
    }

    @Test void queuesAreDurable() {
        assertTrue(config.jobCreatedNotifyQueue().isDurable());
        assertTrue(config.jobCreatedSearchQueue().isDurable());
        assertTrue(config.jobClosedNotifyQueue().isDurable());
    }

    @Test void bindingsUseCorrectKeys() {
        assertEquals(RabbitMQConfig.JOB_CREATED_KEY, config.jobCreatedNotifyBinding().getRoutingKey());
        assertEquals(RabbitMQConfig.JOB_CREATED_KEY, config.jobCreatedSearchBinding().getRoutingKey());
        assertEquals(RabbitMQConfig.JOB_CLOSED_KEY,  config.jobClosedNotifyBinding().getRoutingKey());
    }
}
