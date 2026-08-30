package com.salon.beauty_salon.dtos.salon_service;

import com.salon.beauty_salon.entities.ServiceCategory;
import com.salon.beauty_salon.validators.ValidServiceDuration;
import com.salon.beauty_salon.validators.ValidServiceName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SalonServiceRequest {

    @NotBlank(message = "The name of the service is required")
    @ValidServiceName
    private String name;

    @Size(max = 500, message = "Description limit is 500 characters")
    private String description;

    @NotNull(message = "The price is required")
    @Positive(message = "The price must be a positive number")
    private Double price;

    @NotNull(message = "The duration is required")
    @Positive(message = "The duration must be a positive number")
    @ValidServiceDuration
    private Integer durationMinutes;

    @NotNull(message = "The category is required")
    private ServiceCategory category;
}
