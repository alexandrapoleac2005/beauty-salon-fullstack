package com.salon.beauty_salon.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salon.beauty_salon.dtos.appointment.*;
import com.salon.beauty_salon.entities.AppointmentStatus;
import com.salon.beauty_salon.entities.User;
import com.salon.beauty_salon.repositories.UserRepository;
import com.salon.beauty_salon.security.JwtService;
import com.salon.beauty_salon.services.AppointmentService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AppointmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @BeforeEach
    void setUpSecurityContext() {
        User mockPrincipal = new User();
        mockPrincipal.setEmail("client@salon.com");

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(mockPrincipal, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createAppointment_ShouldReturn201() throws Exception {
        AppointmentCreateRequest request = new AppointmentCreateRequest();
        request.setEmployeeId(2L);
        request.setServiceId(1L);
        request.setStartTime(LocalDateTime.of(2027, 4, 15, 10, 0));
        
        AppointmentResponse response = new AppointmentResponse();
        response.setId(100L);
        response.setStatus(AppointmentStatus.PENDING);

        when(appointmentService.createAppointment(eq("client@salon.com"), any(AppointmentCreateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getAppointmentsByEmployee_ShouldReturn200AndList() throws Exception {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(100L);

        when(appointmentService.getAppointmentsByEmployees(2L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/appointments/employee/2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void cancelAppointment_ShouldReturn200AndCancelledStatus() throws Exception {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(100L);
        response.setStatus(AppointmentStatus.CANCELLED);

        when(appointmentService.cancelAppointment(100L)).thenReturn(response);

        mockMvc.perform(patch("/api/appointments/100/cancel")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(appointmentService).cancelAppointment(100L);
    }

    @Test
    void getBusySlots_ShouldReturn200AndSlots() throws Exception {
        BusySlotResponse slot = new BusySlotResponse(
                LocalDateTime.of(2024, 4, 15, 10, 0),
                LocalDateTime.of(2024, 4, 15, 10, 30)
        );

        when(appointmentService.getBusySlotsForEmployee(eq(2L), any(LocalDate.class)))
                .thenReturn(List.of(slot));

        mockMvc.perform(get("/api/appointments/employee/2/busy-slots")
                        .param("date", "2024-04-15")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }
}