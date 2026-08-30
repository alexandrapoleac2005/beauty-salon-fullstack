package com.salon.beauty_salon.mappers;

import com.salon.beauty_salon.dtos.salon_service.SalonServiceRequest;
import com.salon.beauty_salon.dtos.salon_service.SalonServiceResponse;
import com.salon.beauty_salon.entities.SalonService;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SalonServiceMapper {

    SalonService toEntity(SalonServiceRequest request);

    SalonServiceResponse toDto(SalonService entity);

    List<SalonServiceResponse> toDtoList(List<SalonService> entities);
}
