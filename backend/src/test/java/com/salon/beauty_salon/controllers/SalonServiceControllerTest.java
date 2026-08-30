package com.salon.beauty_salon.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salon.beauty_salon.dtos.salon_service.SalonServiceRequest;
import com.salon.beauty_salon.dtos.salon_service.SalonServiceResponse;
import com.salon.beauty_salon.entities.ServiceCategory;
import com.salon.beauty_salon.entities.User;
import com.salon.beauty_salon.repositories.UserRepository;
import com.salon.beauty_salon.security.JwtService;
import com.salon.beauty_salon.services.SalonServiceService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = SalonServiceController.class)
@AutoConfigureMockMvc(addFilters = false)
class SalonServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SalonServiceService salonServiceService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @BeforeEach
    void setUpSecurityContext() {
        User mockPrincipal = new User();
        mockPrincipal.setEmail("admin@salon.com");

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(mockPrincipal, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createService_ShouldReturn201AndCreatedService() throws Exception {
        SalonServiceRequest request = new SalonServiceRequest();
        request.setName("Tuns");
        request.setPrice(50.0);
        request.setDurationMinutes(30);
        request.setCategory(ServiceCategory.COAFOR_FRIZERIE);

        SalonServiceResponse response = new SalonServiceResponse();
        response.setId(1L);
        response.setName("Tuns");
        response.setPrice(50.0);

        when(salonServiceService.createService(any(SalonServiceRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Tuns"))
                .andExpect(jsonPath("$.price").value(50.0));
    }


    @Test
    void getAllServices_ShouldReturn200AndList() throws Exception {
        SalonServiceResponse service1 = new SalonServiceResponse();
        service1.setId(1L);
        service1.setName("Tuns");

        SalonServiceResponse service2 = new SalonServiceResponse();
        service2.setId(2L);
        service2.setName("Vopsit");

        when(salonServiceService.getAllServices()).thenReturn(List.of(service1, service2));

        mockMvc.perform(get("/api/services")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("Tuns"))
                .andExpect(jsonPath("$[1].name").value("Vopsit"));
    }


    @Test
    void getServiceById_ShouldReturn200AndService() throws Exception {
        SalonServiceResponse response = new SalonServiceResponse();
        response.setId(1L);
        response.setName("Tuns");

        when(salonServiceService.getServiceById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/services/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Tuns"));
    }


    @Test
    void updateService_ShouldReturn200AndUpdatedService() throws Exception {
        SalonServiceRequest request = new SalonServiceRequest();
        request.setName("Tuns VIP");
        request.setPrice(100.0);
        request.setDurationMinutes(45);
        request.setCategory(ServiceCategory.COAFOR_FRIZERIE);

        SalonServiceResponse response = new SalonServiceResponse();
        response.setId(1L);
        response.setName("Tuns VIP");
        response.setPrice(100.0);

        when(salonServiceService.updateService(eq(1L), any(SalonServiceRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/services/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Tuns VIP"))
                .andExpect(jsonPath("$.price").value(100.0));
    }


    @Test
    void deleteService_ShouldReturn204NoContent() throws Exception {
        mockMvc.perform(delete("/api/services/1"))
                .andExpect(status().isNoContent());

        verify(salonServiceService).deleteService(1L);
    }
}