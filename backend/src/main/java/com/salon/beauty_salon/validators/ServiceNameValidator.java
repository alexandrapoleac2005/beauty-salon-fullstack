package com.salon.beauty_salon.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ServiceNameValidator implements ConstraintValidator<ValidServiceName, String> {

    @Override
    public boolean isValid(String serviceName, ConstraintValidatorContext context) {
        if (serviceName == null || serviceName.trim().isEmpty()) {
            return true;
        }
        return serviceName.matches("^[\\p{L}\\d\\s\\-&+]+$");
    }
}