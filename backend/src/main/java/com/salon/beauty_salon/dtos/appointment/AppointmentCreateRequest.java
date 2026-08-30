package com.salon.beauty_salon.dtos.appointment;

import com.salon.beauty_salon.validators.ValidTimeSlot;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AppointmentCreateRequest {

    @NotNull(message = "The employee id is required")
    private Long employeeId;

    @NotNull(message = "The service id is required")
    private Long serviceId;

    @NotNull(message = "The start time of the appointment is required")
    @Future(message = "No past data is allowed")
    @ValidTimeSlot
    private LocalDateTime startTime;
}
