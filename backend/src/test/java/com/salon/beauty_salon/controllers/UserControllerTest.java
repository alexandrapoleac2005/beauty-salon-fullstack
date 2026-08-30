package com.salon.beauty_salon.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salon.beauty_salon.dtos.user.ChangePasswordRequest;
import com.salon.beauty_salon.dtos.user.EmployeeCreateRequest;
import com.salon.beauty_salon.dtos.user.UserProfileUpdateRequest;
import com.salon.beauty_salon.dtos.user.UserResponse;
import com.salon.beauty_salon.entities.User;
import com.salon.beauty_salon.repositories.UserRepository;
import com.salon.beauty_salon.security.JwtService;
import com.salon.beauty_salon.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @BeforeEach
    void setUpSecurityContext() {

        User mockPrincipal = new User();
        mockPrincipal.setEmail("test@salon.com");

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(mockPrincipal, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAllEmployees_ShouldReturn200AndList() throws Exception {

        UserResponse employee = new UserResponse();
        employee.setEmail("angajat@salon.com");
        employee.setFirstName("Ana");

        when(userService.getAllEmployees()).thenReturn(List.of(employee));

        mockMvc.perform(get("/api/users/employees")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].email").value("angajat@salon.com"))
                .andExpect(jsonPath("$[0].firstName").value("Ana"));
    }

    @Test
    void getCurrentUserProfile_ShouldReturn200AndProfile() throws Exception {

        UserResponse profile = new UserResponse();
        profile.setEmail("test@salon.com");
        profile.setFirstName("Client");

        when(userService.getProfile("test@salon.com")).thenReturn(profile);

        mockMvc.perform(get("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@salon.com"))
                .andExpect(jsonPath("$.firstName").value("Client"));
    }

    @Test
    void createEmployee_ShouldReturn201AndCreatedEmployee() throws Exception {

        EmployeeCreateRequest request = new EmployeeCreateRequest();
        request.setEmail("nou@salon.com");
        request.setPassword("Parola123!");
        request.setFirstName("Ion");
        request.setLastName("Popescu");
        request.setPhoneNumber("0712345678");

        UserResponse response = new UserResponse();
        response.setEmail("nou@salon.com");
        response.setFirstName("Ion");

        when(userService.createEmployee(org.mockito.ArgumentMatchers.any(EmployeeCreateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/users/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("nou@salon.com"))
                .andExpect(jsonPath("$.firstName").value("Ion"));
    }

    @Test
    void deactivateEmployee_ShouldReturn204NoContent() throws Exception {
        mockMvc.perform(delete("/api/users/employees/1"))
                .andExpect(status().isNoContent());

        org.mockito.Mockito.verify(userService, org.mockito.Mockito.times(1)).deactivateEmployee(1L);
    }

    @Test
    void updateCurrentUserProfile_ShouldReturn200AndUpdatedProfile() throws Exception {

        UserProfileUpdateRequest request = new UserProfileUpdateRequest();
        request.setFirstName("Vasile");
        request.setLastName("Popa");
        request.setPhoneNumber("0700000000");

        UserResponse response = new UserResponse();
        response.setEmail("test@salon.com");
        response.setFirstName("Vasile");

        when(userService.updateProfile(org.mockito.ArgumentMatchers.eq("test@salon.com"), org.mockito.ArgumentMatchers.any(UserProfileUpdateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Vasile"));
    }

    @Test
    void changePassword_ShouldReturn204NoContent() throws Exception {

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("ParolaVeche123!");
        request.setNewPassword("ParolaNoua123!");

        mockMvc.perform(put("/api/users/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        org.mockito.Mockito.verify(userService, org.mockito.Mockito.times(1))
                .changePassword(org.mockito.ArgumentMatchers.eq("test@salon.com"), org.mockito.ArgumentMatchers.any(ChangePasswordRequest.class));
    }

}