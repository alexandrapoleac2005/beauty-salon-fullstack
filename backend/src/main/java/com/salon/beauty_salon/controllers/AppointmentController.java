package com.salon.beauty_salon.controllers;

import com.salon.beauty_salon.dtos.appointment.*;
import com.salon.beauty_salon.entities.User;
import com.salon.beauty_salon.services.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.ResponseEntity.ok;
import static org.springframework.http.ResponseEntity.status;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    private String getLoggedInUserEmail() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getEmail();
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody AppointmentCreateRequest request) {
        String clientEmail = getLoggedInUserEmail();
        return status(HttpStatus.CREATED).body(appointmentService.createAppointment(clientEmail, request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByClient(@PathVariable Long clientId) {
        return ok(appointmentService.getAppointmentsByClients(clientId));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByEmployee(@PathVariable Long employeeId) {
        return ok(appointmentService.getAppointmentsByEmployees(employeeId));
    }

    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable Long appointmentId) {
        return ok(appointmentService.cancelAppointment(appointmentId));
    }

    @PutMapping("/{appointmentId}/reschedule")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentRescheduleRequest request) {
        return ok(appointmentService.rescheduleAppointment(appointmentId, request));
    }

    @PatchMapping("/{appointmentId}/status")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        return ok(appointmentService.updateAppointmentStatus(appointmentId, request));
    }

    @GetMapping("/employee/{employeeId}/busy-slots")
    @PreAuthorize("hasAnyRole('CLIENT', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<List<BusySlotResponse>> geBusySlots(@PathVariable Long employeeId,
                                                              @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getBusySlotsForEmployee(employeeId, date));
    }

}
