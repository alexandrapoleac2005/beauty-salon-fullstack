package com.salon.beauty_salon.dtos.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginRequest {

    @NotBlank(message = "The email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "The password is required")
    private String password;
}
