package com.salon.beauty_salon.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NameValidator implements ConstraintValidator<ValidName, String> {


    @Override
    public void initialize(ValidName constraintAnnotation) {
    }

    @Override
    public boolean isValid(String nameField, ConstraintValidatorContext constraintValidatorContext) {
        if(nameField == null || nameField.trim().isEmpty()){
            return true;
        }
        return nameField.matches("^[\\p{L}\\s\\-]+$");
    }
}
