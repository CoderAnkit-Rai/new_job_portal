package com.capg.jobservice.repository;

import com.capg.jobservice.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Page<Job> findByCreatedByOrderByCreatedAtDesc(String createdBy, Pageable pageable);

    Page<Job> findByStatus(String status, Pageable pageable);
    Page<Job> findByStatusAndTitleContainingIgnoreCase(String status, String title, Pageable pageable);
    Page<Job> findByStatusAndLocationContainingIgnoreCase(String status, String location, Pageable pageable);
    Page<Job> findByStatusAndCompanyContainingIgnoreCase(String status, String company, Pageable pageable);
    Page<Job> findByStatusAndTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(String status, String title, String location, Pageable pageable);
    Page<Job> findByStatusAndSalaryBetween(String status, Double min, Double max, Pageable pageable);
    Page<Job> findByStatusAndSalaryGreaterThanEqual(String status, Double min, Pageable pageable);
    Page<Job> findByStatusAndSalaryLessThanEqual(String status, Double max, Pageable pageable);
}