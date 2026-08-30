package com.salon.beauty_salon.dtos.appointment;

import com.salon.beauty_salon.entities.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentStatusUpdateRequest {

    @NotNull(message = "The status is required")
    private AppointmentStatus status;
}
