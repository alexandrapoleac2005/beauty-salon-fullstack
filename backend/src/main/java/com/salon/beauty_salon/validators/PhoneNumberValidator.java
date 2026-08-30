package com.salon.beauty_salon.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
    }

    @Override
    public boolean isValid(String phoneNumberField, ConstraintValidatorContext constraintValidatorContext) {
        if(phoneNumberField == null || phoneNumberField.trim().isEmpty()){
            return true;
        }
        return phoneNumberField.matches("^[0-9]{10}$");
    }

}
