package com.capg.applicationservice.service.impl;

import com.capg.applicationservice.dto.ApplicationEvent;
import com.capg.applicationservice.dto.request.ApplicationRequest;
import com.capg.applicationservice.dto.response.ApplicationResponse;
import com.capg.applicationservice.entity.Application;
import com.capg.applicationservice.entity.ApplicationStatus;
import com.capg.applicationservice.entity.Resume;
import com.capg.applicationservice.exception.AlreadyAppliedException;
import com.capg.applicationservice.exception.UnauthorizedException;
import com.capg.applicationservice.repository.ApplicationRepository;
import com.capg.applicationservice.repository.ResumeRepository;
import com.capg.applicationservice.service.ApplicationService;
import com.capg.applicationservice.mapper.ApplicationMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationServiceImpl.class);

    private final ApplicationRepository repository;
    private final RabbitTemplate rabbitTemplate;
    private final ApplicationMapper applicationMapper;
    private final ResumeRepository resumeRepository;

    public ApplicationServiceImpl(ApplicationRepository repository,
                                  RabbitTemplate rabbitTemplate,
                                  ApplicationMapper applicationMapper,
                                  ResumeRepository resumeRepository) {
        this.repository = repository;
        this.rabbitTemplate = rabbitTemplate;
        this.applicationMapper = applicationMapper;
        this.resumeRepository = resumeRepository;
    }

    @Override
    @Transactional
    public ApplicationResponse apply(ApplicationRequest request, String email, String role) {

        log.info("Apply request");

        if (!role.equals("JOB_SEEKER")) {
            log.warn("Apply rejected - not a job seeker");
            throw new UnauthorizedException("Only job seekers can apply");
        }

        if (repository.existsByJobIdAndUserEmail(request.getJobId(), email)) {
            log.warn("Duplicate application");
            throw new AlreadyAppliedException("Already applied to this job");
        }

        Application app = new Application();
        app.setJobId(request.getJobId());
        app.setUserEmail(email);
        app.setStatus(ApplicationStatus.APPLIED);
        app.setAppliedAt(LocalDateTime.now());

        Application saved = repository.save(app);
        log.info("Application saved");

        try {
            ApplicationEvent event = new ApplicationEvent(
                    saved.getApplicationId().toString(),
                    saved.getJobId(),
                    saved.getUserEmail(),
                    saved.getStatus().name()
            );
            rabbitTemplate.convertAndSend("jobportal.exchange", "job.applied", event);
            log.info("RabbitMQ event published");
        } catch (Exception e) {
            log.error("RabbitMQ publish failed", e);
        }

        return applicationMapper.toResponse(saved);
    }

    @Override
    public Page<ApplicationResponse> getMyApplications(String email, int page, int size) {
        return repository.findByUserEmail(email, PageRequest.of(page, size))
                .map(applicationMapper::toResponse);
    }

    @Override
    public String uploadResume(MultipartFile file, String email) {
        try {
            Resume resume = resumeRepository.findByUserEmail(email).orElse(new Resume());
            resume.setUserEmail(email);
            resume.setFileName(file.getOriginalFilename());
            resume.setFileData(file.getBytes());
            resumeRepository.save(resume);
            return "Resume uploaded: " + file.getOriginalFilename();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload resume");
        }
    }

    @Override
    public Page<ApplicationResponse> getApplicants(Long jobId, String role, int page, int size) {
        if (!role.equals("RECRUITER")) {
            log.warn("Unauthorized applicants view");
            throw new UnauthorizedException("Only recruiters can view applicants");
        }
        log.info("Fetching applicants");
        return repository.findByJobId(jobId, PageRequest.of(page, size))
                .map(applicationMapper::toResponse);
    }
}
