package com.salon.beauty_salon.mappers;

import com.salon.beauty_salon.dtos.appointment.AppointmentCreateRequest;
import com.salon.beauty_salon.dtos.appointment.AppointmentResponse;
import com.salon.beauty_salon.entities.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "service", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    @Mapping(target = "status", ignore = true)
    Appointment toEntity(AppointmentCreateRequest request);

    @Mapping(source = "client.id", target = "clientId")
    @Mapping(source = "client.firstName", target = "clientFirstName")
    @Mapping(source = "client.lastName", target = "clientLastName")
    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(source = "employee.firstName", target = "employeeFirstName")
    @Mapping(source = "employee.lastName", target = "employeeLastName")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "service.name", target = "serviceName")
    AppointmentResponse toDto(Appointment entity);

    List<AppointmentResponse> toDtoList(List<Appointment> entry);
}
