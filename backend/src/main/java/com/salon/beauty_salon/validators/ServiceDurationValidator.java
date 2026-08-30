package com.salon.beauty_salon.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ServiceDurationValidator implements ConstraintValidator<ValidServiceDuration, Integer> {

    @Override
    public boolean isValid(Integer duration, ConstraintValidatorContext constraintValidatorContext) {
        if (duration == null) {
            return true;
        }
        return duration % 15 == 0;
    }
}