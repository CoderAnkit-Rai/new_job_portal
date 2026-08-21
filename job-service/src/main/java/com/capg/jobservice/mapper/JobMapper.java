package com.capg.jobservice.mapper;

import com.capg.jobservice.dto.JobEvent;
import com.capg.jobservice.dto.request.JobRequest;
import com.capg.jobservice.dto.response.JobResponse;
import com.capg.jobservice.entity.Job;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JobMapper {

    @Mapping(target = "jobId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Job toEntity(JobRequest request);

    JobResponse toResponse(Job job);

    JobEvent toEvent(Job job);
}
