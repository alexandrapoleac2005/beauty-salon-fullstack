package com.salon.beauty_salon.exceptions;

public class ServiceAlreadyExistsException extends RuntimeException{

    public ServiceAlreadyExistsException(String message){
        super(message);
    }

}
