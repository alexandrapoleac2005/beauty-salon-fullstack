package com.salon.beauty_salon.dtos.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.salon.beauty_salon.dtos.salon_service.SalonServiceResponse;
import com.salon.beauty_salon.entities.Role;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Role role;
    private String token;
    private String profilePictureUrl;
    private List<SalonServiceResponse> services;
}
