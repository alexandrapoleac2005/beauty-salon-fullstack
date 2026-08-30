package com.salon.beauty_salon.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = TimeSlotValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTimeSlot {

    String message() default "Appointments can only be scheduled at exact intervals (e.g., :00, :15, :30, :45).";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}