package com.salon.beauty_salon.dtos.user;

import com.salon.beauty_salon.validators.ValidName;
import com.salon.beauty_salon.validators.ValidPhoneNumber;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequest {

    @NotBlank(message = "The first name is required")
    @ValidName
    private String firstName;

    @NotBlank(message = "The last name is required")
    @ValidName
    private String lastName;

    @NotBlank(message = "The phone number is required")
    @ValidPhoneNumber
    private String phoneNumber;

}
