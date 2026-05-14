package com.capg.notificationservice.config;

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
        assertTrue(config.jobCreatedQueue().isDurable());
        assertTrue(config.jobAppliedQueue().isDurable());
        assertTrue(config.jobClosedQueue().isDurable());
        assertTrue(config.resumeUploadQueue().isDurable());
    }

    @Test void bindingsUseCorrectKeys() {
        assertEquals("job.created",     config.jobCreatedBinding().getRoutingKey());
        assertEquals("job.applied",     config.jobAppliedBinding().getRoutingKey());
        assertEquals("job.closed",      config.jobClosedBinding().getRoutingKey());
        assertEquals("resume.uploaded", config.resumeBinding().getRoutingKey());
    }
}
