package com.salon.beauty_salon.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = ServiceNameValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidServiceName {

    String message() default "The service name can only contain letters, numbers, spaces, and the symbols '-', '+', '&'.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}