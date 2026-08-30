package com.salon.beauty_salon.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salon.beauty_salon.dtos.salon_service.SalonServiceRequest;
import com.salon.beauty_salon.entities.ServiceCategory;
import com.salon.beauty_salon.repositories.AppointmentRepository;
import com.salon.beauty_salon.repositories.SalonServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SalonServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SalonServiceRepository salonServiceRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @BeforeEach
    void cleanDatabase() {
        appointmentRepository.deleteAll();

        salonServiceRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createService_ShouldSaveToDatabase_AndReturn201() throws Exception {

        SalonServiceRequest request = new SalonServiceRequest();
        request.setName("Extensii gene");
        request.setPrice(150.0);
        request.setDurationMinutes(45);
        request.setCategory(ServiceCategory.GENE_SPRANCENE);

        mockMvc.perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Extensii gene"));

        long count = salonServiceRepository.count();
        assertEquals(1, count, "There should be only one service saved in the DB");

        var savedService = salonServiceRepository.findAll().get(0);
        assertEquals("Extensii gene", savedService.getName());
        assertEquals(150.0, savedService.getPrice());
    }
}