package com.salon.beauty_salon.dtos.user;

import com.salon.beauty_salon.validators.StrongPassword;
import com.salon.beauty_salon.validators.ValidName;
import com.salon.beauty_salon.validators.ValidPhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmployeeCreateRequest {

    @NotBlank(message = "The first name is required")
    @ValidName
    private String firstName;

    @NotBlank(message = "The last name is required")
    @ValidName
    private String lastName;

    @NotBlank(message = "The email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "The password is required")
    @Size(min = 6, message = "The password must have at least 6 characters")
    @StrongPassword
    private String password;

    @NotBlank(message = "The phone number is required")
    @ValidPhoneNumber
    private String phoneNumber;

    private String profilePictureUrl;

    private List<Long> serviceIds;
}
