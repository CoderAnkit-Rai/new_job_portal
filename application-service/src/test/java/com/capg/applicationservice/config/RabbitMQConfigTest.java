package com.capg.applicationservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.*;
import static org.junit.jupiter.api.Assertions.*;

class RabbitMQConfigTest {

    private final RabbitMQConfig config = new RabbitMQConfig();

    @Test void exchangeIsTopicExchange() {
        assertTrue(config.jobportalExchange() instanceof TopicExchange);
        assertEquals(RabbitMQConfig.EXCHANGE, config.jobportalExchange().getName());
    }

    @Test void notifyQueueIsDurable() {
        Queue q = config.jobAppliedNotifyQueue();
        assertEquals("job.applied.notify.queue", q.getName());
        assertTrue(q.isDurable());
    }

    @Test void notifyBindingUsesCorrectKey() {
        Binding b = config.jobAppliedNotifyBinding();
        assertEquals(RabbitMQConfig.JOB_APPLIED_KEY, b.getRoutingKey());
    }
}
