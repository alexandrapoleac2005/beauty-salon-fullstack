package com.salon.beauty_salon.dtos.appointment;

import com.salon.beauty_salon.entities.AppointmentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AppointmentResponse {

    private Long id;

    private Long clientId;
    private String clientFirstName;
    private String clientLastName;

    private Long employeeId;
    private String employeeFirstName;
    private String employeeLastName;

    private Long serviceId;
    private String serviceName;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
}
