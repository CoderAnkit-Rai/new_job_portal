package com.capg.applicationservice.controller;

import com.capg.applicationservice.dto.request.ApplicationRequest;
import com.capg.applicationservice.dto.response.ApplicationResponse;
import com.capg.applicationservice.service.ApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @Operation(summary = "Upload resume", requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadResume(
            @RequestParam("file") MultipartFile file,
            @Parameter(hidden = true) @RequestHeader("X-User-Email") String email,
            @Parameter(hidden = true) @RequestHeader("X-User-Role") String role
    ) {
        if (!role.equals("JOB_SEEKER")) {
            return ResponseEntity.status(403).body("Only job seekers can upload a resume");
        }
        return ResponseEntity.ok(service.uploadResume(file, email));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(
            @Valid @RequestBody ApplicationRequest request,
            @Parameter(hidden = true) @RequestHeader("X-User-Email") String email,
            @Parameter(hidden = true) @RequestHeader("X-User-Role") String role
    ) {
        return ResponseEntity.ok(service.apply(request, email, role));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @Parameter(hidden = true) @RequestHeader("X-User-Email") String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.getMyApplications(email, page, size));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<Page<ApplicationResponse>> getApplicants(
            @PathVariable Long jobId,
            @Parameter(hidden = true) @RequestHeader("X-User-Role") String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.getApplicants(jobId, role, page, size));
    }
}
