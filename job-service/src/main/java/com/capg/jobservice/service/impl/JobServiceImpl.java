package com.capg.jobservice.service.impl;

import com.capg.jobservice.dto.request.JobRequest;
import com.capg.jobservice.dto.response.JobResponse;
import com.capg.jobservice.entity.Job;
import com.capg.jobservice.exception.JobNotFoundException;
import com.capg.jobservice.exception.UnauthorizedException;
import com.capg.jobservice.repository.JobRepository;
import com.capg.jobservice.service.JobService;
import com.capg.jobservice.mapper.JobMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class JobServiceImpl implements JobService {

    private static final Logger log = LoggerFactory.getLogger(JobServiceImpl.class);

    private final JobRepository jobRepository;
    private final RabbitTemplate rabbitTemplate;
    private final JobMapper jobMapper;

    private static final String JOB_NOT_FOUND = "Job not found";
    private static final String EXCHANGE       = "jobportal.exchange";
    private static final String ROUTING_KEY    = "job.created";

    public JobServiceImpl(JobRepository jobRepository, RabbitTemplate rabbitTemplate, JobMapper jobMapper) {
        this.jobRepository = jobRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.jobMapper = jobMapper;
    }

    // CREATE JOB
    @Override
    @Transactional
    public JobResponse createJob(JobRequest request, String email, String role) {

        if (!"RECRUITER".equals(role)) {
            log.warn("Unauthorized job creation attempt");
            throw new UnauthorizedException("Only recruiters can create jobs");
        }

        Job job = jobMapper.toEntity(request);
        job.setCreatedBy(email);
        job.setStatus("OPEN");
        job.setCreatedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());

        Job saved = jobRepository.save(job);
        log.info("Job created successfully");

        try {
            rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, jobMapper.toEvent(saved));
            log.info("RabbitMQ event published exchange={} routingKey={} jobId={}", EXCHANGE, ROUTING_KEY, saved.getJobId());
        } catch (Exception e) {
            log.error("RabbitMQ publish failed jobId={}", saved.getJobId(), e);
        }

        return jobMapper.toResponse(saved);
    }

    // GET JOB BY ID
    @Override
    public JobResponse getJobById(Long jobId) {
        log.debug("Fetching job from DB");

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> {
                    log.warn("Job not found");
                    return new JobNotFoundException(JOB_NOT_FOUND);
                });

        return jobMapper.toResponse(job);
    }

    // GET ALL JOBS
    @Override
    public Page<JobResponse> getAllJobs(String email, String role, int page, int size) {
        if ("RECRUITER".equals(role) && email != null) {
            log.debug("Fetching jobs by recruiter");
            return jobRepository.findByCreatedByOrderByCreatedAtDesc(email, PageRequest.of(page, size))
                    .map(jobMapper::toResponse);
        }
        log.debug("Fetching all jobs from DB");
        return jobRepository.findAll(PageRequest.of(page, size))
                .map(jobMapper::toResponse);
    }

    // SEARCH JOBS
    @Override
    public Page<JobResponse> searchJobs(String keyword, String location, String company,
                                        Double minSalary, Double maxSalary, int page, int size) {
        final String OPEN = "OPEN";
        boolean hasKeyword  = keyword != null && !keyword.isBlank();
        boolean hasLocation = location != null && !location.isBlank();
        boolean hasCompany  = company != null && !company.isBlank();
        PageRequest pageable = PageRequest.of(page, size);

        if (minSalary != null && maxSalary != null)
            return jobRepository.findByStatusAndSalaryBetween(OPEN, minSalary, maxSalary, pageable).map(jobMapper::toResponse);
        else if (minSalary != null)
            return jobRepository.findByStatusAndSalaryGreaterThanEqual(OPEN, minSalary, pageable).map(jobMapper::toResponse);
        else if (maxSalary != null)
            return jobRepository.findByStatusAndSalaryLessThanEqual(OPEN, maxSalary, pageable).map(jobMapper::toResponse);
        else if (hasCompany)
            return jobRepository.findByStatusAndCompanyContainingIgnoreCase(OPEN, company, pageable).map(jobMapper::toResponse);
        else if (hasKeyword && hasLocation)
            return jobRepository.findByStatusAndTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(OPEN, keyword, location, pageable).map(jobMapper::toResponse);
        else if (hasKeyword)
            return jobRepository.findByStatusAndTitleContainingIgnoreCase(OPEN, keyword, pageable).map(jobMapper::toResponse);
        else if (hasLocation)
            return jobRepository.findByStatusAndLocationContainingIgnoreCase(OPEN, location, pageable).map(jobMapper::toResponse);
        else
            return jobRepository.findByStatus(OPEN, pageable).map(jobMapper::toResponse);
    }
}
