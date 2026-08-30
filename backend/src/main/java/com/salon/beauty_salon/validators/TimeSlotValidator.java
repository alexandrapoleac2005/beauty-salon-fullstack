package com.salon.beauty_salon.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDateTime;

public class TimeSlotValidator implements ConstraintValidator<ValidTimeSlot, LocalDateTime> {

    @Override
    public boolean isValid(LocalDateTime startTime, ConstraintValidatorContext context) {
        if (startTime == null) {
            return true;
        }

        int minute = startTime.getMinute();
        return minute % 15 == 0;
    }
}