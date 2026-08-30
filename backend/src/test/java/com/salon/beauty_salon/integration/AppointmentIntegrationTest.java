package com.salon.beauty_salon.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salon.beauty_salon.dtos.appointment.AppointmentCreateRequest;
import com.salon.beauty_salon.entities.*;
import com.salon.beauty_salon.repositories.AppointmentRepository;
import com.salon.beauty_salon.repositories.SalonServiceRepository;
import com.salon.beauty_salon.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AppointmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SalonServiceRepository salonServiceRepository;

    private User savedClient;
    private User savedEmployee;
    private SalonService savedService;


    @BeforeEach
    void setupDatabase() {
        appointmentRepository.deleteAll();
        userRepository.deleteAll();
        salonServiceRepository.deleteAll();

        User client = new User();
        client.setEmail("client_real@salon.com");
        client.setFirstName("Maria");
        client.setLastName("Ionescu");
        client.setPassword("Parola123!");
        client.setPhoneNumber("0711111111");
        client.setRole(Role.CLIENT);
        savedClient = userRepository.save(client);

        User employee = new User();
        employee.setEmail("angajat_real@salon.com");
        employee.setFirstName("Andreea");
        employee.setLastName("Popa");
        employee.setPassword("Parola123!");
        employee.setPhoneNumber("0722222222");
        employee.setRole(Role.EMPLOYEE);
        savedEmployee = userRepository.save(employee);

        SalonService service = new SalonService();
        service.setName("Tuns Balayage");
        service.setPrice(350.0);
        service.setDurationMinutes(120);
        service.setCategory(ServiceCategory.COAFOR_FRIZERIE);
        service.setActive(true);
        savedService = salonServiceRepository.save(service);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        savedClient,
                        null,
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CLIENT"))
                );
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    void createAppointment_ShouldSaveToDatabase_AndReturn201() throws Exception {

        AppointmentCreateRequest request = new AppointmentCreateRequest();
        request.setEmployeeId(savedEmployee.getId());
        request.setServiceId(savedService.getId());

        request.setStartTime(LocalDateTime.of(2027, 4, 15, 10, 0));

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        long count = appointmentRepository.count();
        assertEquals(1, count, "The appointment should be saved in H2");

        var savedAppointment = appointmentRepository.findAll().get(0);
        assertEquals(savedEmployee.getId(), savedAppointment.getEmployee().getId());
        assertEquals(savedService.getId(), savedAppointment.getService().getId());
        assertEquals(AppointmentStatus.PENDING, savedAppointment.getStatus());
    }
}