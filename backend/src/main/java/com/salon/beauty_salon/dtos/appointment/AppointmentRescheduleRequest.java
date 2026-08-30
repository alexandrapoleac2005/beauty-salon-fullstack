package com.salon.beauty_salon.dtos.appointment;

import com.salon.beauty_salon.validators.ValidTimeSlot;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AppointmentRescheduleRequest {

    @NotNull(message = "The start time is required")
    @Future(message = "No past data is allowed")
    @ValidTimeSlot
    private LocalDateTime newStartTime;
}
