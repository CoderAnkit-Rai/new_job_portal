package com.capg.jobservice.controller;

import com.capg.jobservice.dto.request.JobRequest;
import com.capg.jobservice.dto.response.JobResponse;
import com.capg.jobservice.service.JobService;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private static final Logger log = LoggerFactory.getLogger(JobController.class);

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest request,
            @Parameter(hidden = true) @RequestHeader("X-User-Email") String email,
            @Parameter(hidden = true) @RequestHeader("X-User-Role") String role) {
        log.info("POST /api/jobs - create job request received");
        return ResponseEntity.ok(jobService.createJob(request, email, role));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long jobId) {
        log.info("GET /api/jobs by id");
        return ResponseEntity.ok(jobService.getJobById(jobId));
    }

    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Email", required = false) String email,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Role", required = false) String role) {
        log.info("GET /api/jobs list email={} role={}", email, role);
        return ResponseEntity.ok(jobService.getAllJobs(email, role, page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET /api/jobs/search");
        return ResponseEntity.ok(jobService.searchJobs(keyword, location, company, minSalary, maxSalary, page, size));
    }
}
