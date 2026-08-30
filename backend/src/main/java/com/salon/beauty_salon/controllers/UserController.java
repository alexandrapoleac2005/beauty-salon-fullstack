package com.salon.beauty_salon.controllers;

import com.salon.beauty_salon.dtos.user.*;
import com.salon.beauty_salon.entities.User;
import com.salon.beauty_salon.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private String getLoggedInUserEmail() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getEmail();
    }

    @GetMapping("/employees")
    public ResponseEntity<List<UserResponse>> getAllEmployees(){
        return ResponseEntity.ok(userService.getAllEmployees());
    }

    @PostMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createEmployee(@Valid @RequestBody EmployeeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createEmployee(request));
    }

    @DeleteMapping("/employees/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable Long id) {
        userService.deactivateEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping ("/me")
    ResponseEntity<UserResponse> getCurrentUserProfile(){
        String email = getLoggedInUserEmail();
        return ResponseEntity.ok(userService.getProfile(email));
    }

    @PutMapping("/me")
    ResponseEntity<UserResponse> updateCurrentUserProfile(@Valid @RequestBody UserProfileUpdateRequest userProfileUpdateRequest) {
        String email = getLoggedInUserEmail();
        return ResponseEntity.ok(userService.updateProfile(email, userProfileUpdateRequest));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest){
        String email = getLoggedInUserEmail();
        userService.changePassword(email, changePasswordRequest);
        return ResponseEntity.noContent().build();
    }

}