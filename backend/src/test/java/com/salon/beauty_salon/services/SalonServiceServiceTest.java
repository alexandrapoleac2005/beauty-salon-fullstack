package com.salon.beauty_salon.services;

import com.salon.beauty_salon.dtos.salon_service.SalonServiceRequest;
import com.salon.beauty_salon.dtos.salon_service.SalonServiceResponse;
import com.salon.beauty_salon.entities.SalonService;
import com.salon.beauty_salon.exceptions.ResourceNotFoundException;
import com.salon.beauty_salon.exceptions.ServiceAlreadyExistsException;
import com.salon.beauty_salon.mappers.SalonServiceMapper;
import com.salon.beauty_salon.repositories.SalonServiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalonServiceServiceTest {

    @Mock
    private SalonServiceRepository salonServiceRepository;

    @Mock
    private SalonServiceMapper salonServiceMapper;

    @InjectMocks
    private SalonServiceService salonServiceService;


    @Test
    void createService_WhenNameAlreadyExists_ShouldThrowException() {
        SalonServiceRequest request = new SalonServiceRequest();
        request.setName("Tuns");

        when(salonServiceRepository.existsByName("Tuns")).thenReturn(true);

        assertThrows(ServiceAlreadyExistsException.class, () -> {
            salonServiceService.createService(request);
        });

        verify(salonServiceRepository, never()).save(any(SalonService.class));
    }

    @Test
    void createService_WhenValidRequest_ShouldSaveAndReturnResponse() {
        SalonServiceRequest request = new SalonServiceRequest();
        request.setName("Tuns");

        SalonService entity = new SalonService();
        entity.setName("Tuns");

        SalonService savedEntity = new SalonService();
        savedEntity.setId(1L);
        savedEntity.setName("Tuns");

        SalonServiceResponse expectedResponse = new SalonServiceResponse();
        expectedResponse.setId(1L);
        expectedResponse.setName("Tuns");

        when(salonServiceRepository.existsByName("Tuns")).thenReturn(false);
        when(salonServiceMapper.toEntity(request)).thenReturn(entity);
        when(salonServiceRepository.save(entity)).thenReturn(savedEntity);
        when(salonServiceMapper.toDto(savedEntity)).thenReturn(expectedResponse);

        SalonServiceResponse actualResponse = salonServiceService.createService(request);

        assertNotNull(actualResponse);
        assertEquals(1L, actualResponse.getId());
        assertEquals("Tuns", actualResponse.getName());
        verify(salonServiceRepository, times(1)).save(entity);
    }


    @Test
    void getAllServices_ShouldReturnListOfResponses() {
        List<SalonService> entities = List.of(new SalonService(), new SalonService());
        List<SalonServiceResponse> expectedResponses = List.of(new SalonServiceResponse(), new SalonServiceResponse());

        when(salonServiceRepository.findAll()).thenReturn(entities);
        when(salonServiceMapper.toDtoList(entities)).thenReturn(expectedResponses);

        List<SalonServiceResponse> actualResponses = salonServiceService.getAllServices();

        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        verify(salonServiceRepository, times(1)).findAll();
    }


    @Test
    void getServiceById_WhenServiceNotFound_ShouldThrowException() {
        when(salonServiceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            salonServiceService.getServiceById(99L);
        });
    }

    @Test
    void getServiceById_WhenServiceFound_ShouldReturnResponse() {
        SalonService entity = new SalonService();
        entity.setId(1L);

        SalonServiceResponse expectedResponse = new SalonServiceResponse();
        expectedResponse.setId(1L);

        when(salonServiceRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(salonServiceMapper.toDto(entity)).thenReturn(expectedResponse);

        SalonServiceResponse actualResponse = salonServiceService.getServiceById(1L);

        assertNotNull(actualResponse);
        assertEquals(1L, actualResponse.getId());
    }


    @Test
    void updateService_WhenServiceNotFound_ShouldThrowException() {
        SalonServiceRequest request = new SalonServiceRequest();

        when(salonServiceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            salonServiceService.updateService(99L, request);
        });

        verify(salonServiceRepository, never()).save(any(SalonService.class));
    }

    @Test
    void updateService_WhenNameExistsForAnotherId_ShouldThrowException() {
        SalonServiceRequest request = new SalonServiceRequest();
        request.setName(" Vopsit ");

        SalonService existingService = new SalonService();
        existingService.setId(1L);

        when(salonServiceRepository.findById(1L)).thenReturn(Optional.of(existingService));
        when(salonServiceRepository.existsByNameAndIdNot("Vopsit", 1L)).thenReturn(true);

        assertThrows(ServiceAlreadyExistsException.class, () -> {
            salonServiceService.updateService(1L, request);
        });

        verify(salonServiceRepository, never()).save(any(SalonService.class));
    }

    @Test
    void updateService_WhenValidRequest_ShouldUpdateAndReturnResponse() {
        SalonServiceRequest request = new SalonServiceRequest();
        request.setName("Masaj");
        request.setPrice(100.0);
        request.setDurationMinutes(60);

        SalonService existingService = new SalonService();
        existingService.setId(1L);
        existingService.setName("Vechiul Nume");

        SalonServiceResponse expectedResponse = new SalonServiceResponse();
        expectedResponse.setName("Masaj");

        when(salonServiceRepository.findById(1L)).thenReturn(Optional.of(existingService));
        when(salonServiceRepository.existsByNameAndIdNot("Masaj", 1L)).thenReturn(false);
        when(salonServiceRepository.save(existingService)).thenReturn(existingService);
        when(salonServiceMapper.toDto(existingService)).thenReturn(expectedResponse);

        SalonServiceResponse actualResponse = salonServiceService.updateService(1L, request);

        assertNotNull(actualResponse);
        assertEquals("Masaj", existingService.getName());
        assertEquals(100.0, existingService.getPrice());
        assertEquals(60, existingService.getDurationMinutes());
        verify(salonServiceRepository, times(1)).save(existingService);
    }


    @Test
    void deleteService_WhenServiceNotFound_ShouldThrowException() {
        when(salonServiceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            salonServiceService.deleteService(99L);
        });
    }

    @Test
    void deleteService_WhenServiceFound_ShouldSetInactiveAndSave() {
        SalonService existingService = new SalonService();
        existingService.setId(1L);
        existingService.setActive(true);

        when(salonServiceRepository.findById(1L)).thenReturn(Optional.of(existingService));

        salonServiceService.deleteService(1L);

        assertFalse(existingService.isActive(), "The service should be marked as inactive");
        verify(salonServiceRepository, times(1)).save(existingService);
    }
}