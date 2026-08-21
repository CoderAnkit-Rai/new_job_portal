package com.capg.applicationservice.service;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.capg.applicationservice.dto.request.ApplicationRequest;
import com.capg.applicationservice.dto.response.ApplicationResponse;

public interface ApplicationService {

	ApplicationResponse apply(ApplicationRequest request, String email, String role);

	Page<ApplicationResponse> getMyApplications(String email, int page, int size);

	Page<ApplicationResponse> getApplicants(Long jobId, String role, int page, int size);

	String uploadResume(MultipartFile file, String email);
}
