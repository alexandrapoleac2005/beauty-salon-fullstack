package com.salon.beauty_salon.dtos.user;

import com.salon.beauty_salon.validators.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    @NotBlank(message = "The old password is required")
    private String oldPassword;

    @NotBlank(message = "The new password is required")
    @Size(min = 6, message = "The new password must have at least 6 characters")
    @StrongPassword
    private String newPassword;
}
