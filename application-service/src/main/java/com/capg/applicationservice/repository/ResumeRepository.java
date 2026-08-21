package com.capg.applicationservice.repository;

import com.capg.applicationservice.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, String> {
    Optional<Resume> findByUserEmail(String userEmail);
}
