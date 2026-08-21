package com.capg.jobservice.service;

import com.capg.jobservice.dto.request.JobRequest;
import com.capg.jobservice.dto.response.JobResponse;
import org.springframework.data.domain.Page;

public interface JobService {

	JobResponse createJob(JobRequest request, String recruiterEmail, String role);

	JobResponse getJobById(Long jobId);

    Page<JobResponse> getAllJobs(String email, String role, int page, int size);

    Page<JobResponse> searchJobs(String keyword, String location, String company, Double minSalary, Double maxSalary, int page, int size);
}