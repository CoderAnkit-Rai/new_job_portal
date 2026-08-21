package com.capg.userservice.service.impl;

import com.capg.userservice.dto.request.UserLoginRequest;
import com.capg.userservice.dto.request.UserRegisterRequest;
import com.capg.userservice.dto.response.UserResponse;
import com.capg.userservice.entity.User;
import com.capg.userservice.exception.AppException;
import com.capg.userservice.repository.UserRepository;
import com.capg.userservice.service.UserService;
import com.capg.userservice.util.JwtUtil;
import com.capg.userservice.mapper.UserMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserResponse registerUser(UserRegisterRequest request) {
        log.info("Registering new user");
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already exists");
            throw new AppException("Email already exists", HttpStatus.BAD_REQUEST);
        }
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        log.info("User registered successfully");
        return userMapper.toResponse(savedUser);
    }

    @Override
    public String loginUser(UserLoginRequest request) {
        log.info("Login attempt");
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found");
                    return new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
                });
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed - wrong password");
            throw new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
        log.info("Login successful");
        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }
}
