package com.salon.beauty_salon.controllers;

import com.salon.beauty_salon.dtos.salon_service.SalonServiceRequest;
import com.salon.beauty_salon.dtos.salon_service.SalonServiceResponse;
import com.salon.beauty_salon.services.SalonServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.ResponseEntity.ok;
import static org.springframework.http.ResponseEntity.status;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class SalonServiceController {

    private final SalonServiceService salonServiceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalonServiceResponse> createService(@Valid @RequestBody SalonServiceRequest request){
        return status(HttpStatus.CREATED).body(salonServiceService.createService(request));
    }

    @GetMapping
    public ResponseEntity<List<SalonServiceResponse>> getAllServices(){
        return ok(salonServiceService.getAllServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalonServiceResponse> getServiceById(@PathVariable Long id){
        return ok(salonServiceService.getServiceById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalonServiceResponse> updateService(@PathVariable Long id, @Valid @RequestBody SalonServiceRequest salonServiceRequest){
        return ok(salonServiceService.updateService(id, salonServiceRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService (@PathVariable Long id){
        salonServiceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

}
