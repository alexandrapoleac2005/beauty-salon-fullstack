package com.salon.beauty_salon.services;

import com.salon.beauty_salon.dtos.salon_service.SalonServiceRequest;
import com.salon.beauty_salon.dtos.salon_service.SalonServiceResponse;
import com.salon.beauty_salon.entities.SalonService;
import com.salon.beauty_salon.exceptions.ResourceNotFoundException;
import com.salon.beauty_salon.exceptions.ServiceAlreadyExistsException;
import com.salon.beauty_salon.mappers.SalonServiceMapper;
import com.salon.beauty_salon.repositories.SalonServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalonServiceService {

    private final SalonServiceRepository salonServiceRepository;
    private final SalonServiceMapper salonServiceMapper;

    public SalonServiceResponse createService(SalonServiceRequest request) {

        if (salonServiceRepository.existsByName(request.getName())) {
            throw new ServiceAlreadyExistsException("The service already exists!");
        }
        return salonServiceMapper.toDto(salonServiceRepository.save(salonServiceMapper.toEntity(request)));
    }

    public List<SalonServiceResponse> getAllServices() {
        return salonServiceMapper.toDtoList(salonServiceRepository.findAll());
    }

    public SalonServiceResponse getServiceById(Long id){
        SalonService salonService = salonServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("The service was not found"));

        return salonServiceMapper.toDto(salonService);
    }

    public SalonServiceResponse updateService(Long id, SalonServiceRequest salonServiceRequest){
        SalonService existingService = salonServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("The service was not found"));

        String newCleanName = salonServiceRequest.getName().trim();

        if (salonServiceRepository.existsByNameAndIdNot(newCleanName, id)) {
            throw new ServiceAlreadyExistsException("The service already exists!");
        }

        existingService.setName(newCleanName);
        existingService.setDescription(salonServiceRequest.getDescription());
        existingService.setPrice(salonServiceRequest.getPrice());
        existingService.setDurationMinutes(salonServiceRequest.getDurationMinutes());
        existingService.setCategory(salonServiceRequest.getCategory());

        return salonServiceMapper.toDto(salonServiceRepository.save(existingService));
    }

    public void deleteService(Long id){
        SalonService existingService = salonServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("The service was not found"));

        existingService.setActive(false);
        salonServiceRepository.save(existingService);
    }
}
