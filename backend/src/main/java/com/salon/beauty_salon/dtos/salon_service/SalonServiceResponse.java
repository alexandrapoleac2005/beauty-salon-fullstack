package com.salon.beauty_salon.dtos.salon_service;

import com.salon.beauty_salon.entities.ServiceCategory;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SalonServiceResponse {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer durationMinutes;
    private ServiceCategory category;

}
