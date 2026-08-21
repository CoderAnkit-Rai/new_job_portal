package com.capg.notificationservice.consumer;

import com.capg.notificationservice.config.RabbitMQConfig;
import com.capg.notificationservice.dto.ApplicationEvent;
import com.capg.notificationservice.dto.JobClosedEvent;
import com.capg.notificationservice.dto.JobEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    @RabbitListener(queues = RabbitMQConfig.JOB_CREATED_QUEUE)
    public void handleJobCreated(JobEvent event) {
        log.info("[Notification] Job created jobId={} title={}", event.getJobId(), event.getTitle());
    }

    @RabbitListener(queues = RabbitMQConfig.JOB_APPLIED_QUEUE)
    public void handleJobApplied(ApplicationEvent event) {
        log.info("[Notification] Job applied jobId={} candidate={}", event.getJobId(), event.getUserEmail());
    }

    @RabbitListener(queues = RabbitMQConfig.JOB_CLOSED_QUEUE)
    public void handleJobClosed(JobClosedEvent event) {
        log.info("[Notification] Job closed jobId={} title={}", event.getJobId(), event.getTitle());
    }
}
