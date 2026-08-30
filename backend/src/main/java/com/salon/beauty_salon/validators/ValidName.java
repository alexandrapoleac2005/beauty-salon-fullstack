package com.salon.beauty_salon.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = NameValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidName {

    String message() default "The name cand only contain letters, spaces and hyphens";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
