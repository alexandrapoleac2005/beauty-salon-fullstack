package com.salon.beauty_salon.exceptions;

import com.salon.beauty_salon.dtos.error_message.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.View;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.ResponseEntity.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final View error;

    public GlobalExceptionHandler(View error) {
        this.error = error;
    }

    @ExceptionHandler({
           ServiceAlreadyExistsException.class,
           EmailAlreadyExistsException.class,
           IsOverlappedException.class
   })
    public ResponseEntity<ApiErrorResponse> handleConflicts (RuntimeException exception){
       ApiErrorResponse errorResponse = new ApiErrorResponse(
               LocalDateTime.now(),
               HttpStatus.CONFLICT.value(),
               HttpStatus.CONFLICT.getReasonPhrase(),
               exception.getMessage()
       );
       return status(HttpStatus.CONFLICT).body(errorResponse);
   }

   @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(ResourceNotFoundException exception){
       ApiErrorResponse errorResponse = new ApiErrorResponse(
               LocalDateTime.now(),
               HttpStatus.NOT_FOUND.value(),
               HttpStatus.NOT_FOUND.getReasonPhrase(),
               exception.getMessage()
       );
       return status(HttpStatus.NOT_FOUND).body(errorResponse);
   }

   @ExceptionHandler(InvalidCredentialsException.class)
   public ResponseEntity<ApiErrorResponse> handleIncorrectPassword(InvalidCredentialsException exception){
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                exception.getMessage()
        );
       return status(HttpStatus.UNAUTHORIZED).body(errorResponse);

   }

   @ExceptionHandler({
           SalonClosedException.class,
           InvalidRoleException.class
   })
   public ResponseEntity<ApiErrorResponse> handleSalonClosed(SalonClosedException exception){
       ApiErrorResponse errorResponse = new ApiErrorResponse(
               LocalDateTime.now(),
               HttpStatus.BAD_REQUEST.value(),
               HttpStatus.BAD_REQUEST.getReasonPhrase(),
               exception.getMessage()
       );
       return status(HttpStatus.BAD_REQUEST).body(errorResponse);
   }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException exception){
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                exception.getMessage()
        );
        return status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

   @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException exception){
       Map<String, String> validationErrors = new HashMap<>();

       exception.getBindingResult().getAllErrors().forEach((error) -> {
           String fieldName = ((FieldError) error).getField();
           String errorMessage = error.getDefaultMessage();
           validationErrors.put(fieldName, errorMessage);
       });

       Map<String, Object> response = new HashMap<>();
       response.put("timestamp", LocalDateTime.now());
       response.put("status", HttpStatus.BAD_REQUEST.value());
       response.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase());
       response.put("message", "Validation failed for one or more fields");
       response.put("validationErrors", validationErrors);

       return status(HttpStatus.BAD_REQUEST).body(response);
   }

}
