package com.capg.userservice.controller;

import com.capg.userservice.dto.request.UpdateUserRequest;
import com.capg.userservice.dto.request.UserLoginRequest;
import com.capg.userservice.dto.request.UserRegisterRequest;
import com.capg.userservice.dto.response.UserResponse;
import com.capg.userservice.service.UserService;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody UserRegisterRequest request) {
        log.info("POST /api/users/register");
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(
            @Valid @RequestBody UserLoginRequest request) {
        log.info("POST /api/users/login");
        String token = userService.loginUser(request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/{id}") 
    public ResponseEntity<UserResponse> getUser(
            @PathVariable Long id,
            @Parameter(hidden = true) @RequestHeader("X-User-Email") String email,
            @Parameter(hidden = true) @RequestHeader("X-User-Role") String role) {
        log.info("GET /api/users by id");
        return ResponseEntity.ok(userService.getUserById(id, email, role));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @Parameter(hidden = true) @RequestHeader("X-User-Email") String email,
            @Parameter(hidden = true) @RequestHeader("X-User-Role") String role) {
        log.info("PUT /api/users by id");
        return ResponseEntity.ok(userService.updateUser(id, request, email, role));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getLoggedInUser(
            @Parameter(hidden = true) @RequestHeader("X-User-Email") String email) {
        log.info("GET /api/users/me");
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/by-email/{userEmail}")
    public ResponseEntity<UserResponse> getUserByEmail(
            @PathVariable String userEmail,
            @Parameter(hidden = true) @RequestHeader("X-User-Role") String role) {
        log.info("GET /api/users/by-email");
        if (!role.equals("RECRUITER") && !role.equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.getUserByEmail(userEmail));
    }
}
