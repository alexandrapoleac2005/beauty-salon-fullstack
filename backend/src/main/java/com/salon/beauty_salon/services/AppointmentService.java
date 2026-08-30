package com.salon.beauty_salon.services;

import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.salon.beauty_salon.dtos.appointment.*;
import com.salon.beauty_salon.entities.Appointment;
import com.salon.beauty_salon.entities.AppointmentStatus;
import com.salon.beauty_salon.entities.SalonService;
import com.salon.beauty_salon.entities.User;
import com.salon.beauty_salon.exceptions.InvalidRoleException;
import com.salon.beauty_salon.exceptions.IsOverlappedException;
import com.salon.beauty_salon.exceptions.ResourceNotFoundException;
import com.salon.beauty_salon.exceptions.SalonClosedException;
import com.salon.beauty_salon.mappers.AppointmentMapper;
import com.salon.beauty_salon.repositories.AppointmentRepository;
import com.salon.beauty_salon.repositories.SalonServiceRepository;
import com.salon.beauty_salon.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final SalonServiceRepository salonServiceRepository;
    private final AppointmentMapper appointmentMapper;
    private final MailService mailService;


    private void validateBusinessHours(LocalDateTime start, LocalDateTime end){

        int startHour = start.getHour();
        int endHour = end.getHour();
        int endMinute = end.getMinute();
        DayOfWeek day = start.getDayOfWeek();

        if(day == DayOfWeek.SUNDAY){
            throw new SalonClosedException("The salon is closed on sundays");
        }

        if (startHour < 9 || (endHour > 18 || (endHour == 18 && endMinute > 0))) {
            throw new SalonClosedException("Appointments must be between 09:00 and 18:00.");
        }
    }

    public AppointmentResponse createAppointment(String clientEmail, AppointmentCreateRequest request){

        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No client found"));
        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("No employee found"));

        if(!employee.getRole().name().equals("EMPLOYEE")){
            throw new InvalidRoleException("The selected user is not an employee");
        }

        SalonService service = salonServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("No service found"));

        LocalDateTime calculatedEndTime = request.getStartTime().plusMinutes(service.getDurationMinutes());

        validateBusinessHours(request.getStartTime(), calculatedEndTime);

        if(appointmentRepository.hasOverlappingAppointments(employee.getId(), request.getStartTime(), calculatedEndTime)){
            throw new IsOverlappedException("The appointment cannot be registered. The employee is already busy");
        }

        Appointment appointmentToSave = appointmentMapper.toEntity(request);

        appointmentToSave.setClient(client);
        appointmentToSave.setEmployee(employee);
        appointmentToSave.setService(service);

        appointmentToSave.setEndTime(calculatedEndTime);
        appointmentToSave.setStatus(AppointmentStatus.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointmentToSave);

        mailService.sendAppointmentConfirmation(
                client.getEmail(),
                client.getFirstName(),
                service.getName(),
                employee.getFirstName(),
                employee.getLastName(),
                savedAppointment.getStartTime()
        );


        return appointmentMapper.toDto(savedAppointment);
    }

    public AppointmentResponse updateAppointmentStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(request.getStatus());
        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    public AppointmentResponse rescheduleAppointment(Long appointmentId, AppointmentRescheduleRequest appointmentRescheduleRequest){

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot reschedule a cancelled or completed appointment.");
        }

        SalonService service = appointment.getService();
        LocalDateTime newEndTime = appointmentRescheduleRequest.getNewStartTime().plusMinutes(service.getDurationMinutes());

        validateBusinessHours(appointmentRescheduleRequest.getNewStartTime(), newEndTime);

        if (appointmentRepository.hasOverlappingAppointmentsForReschedule(appointment.getEmployee().getId(), appointmentId, appointmentRescheduleRequest.getNewStartTime(), newEndTime)) {
            throw new IsOverlappedException("The new time slot is not available.");
        }

        appointment.setStartTime(appointmentRescheduleRequest.getNewStartTime());
        appointment.setEndTime(newEndTime);

        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }


    public List<AppointmentResponse> getAppointmentsByClients(Long clientId){
        return appointmentMapper.toDtoList(appointmentRepository.findByClientId(clientId));
    }

    public List<AppointmentResponse> getAppointmentsByEmployees(Long employeeId){
        return appointmentMapper.toDtoList(appointmentRepository.findByEmployeeId(employeeId));
    }

    public AppointmentResponse cancelAppointment(Long appointmentId){
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CANCELLED);

        Appointment cancelledAppointment = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(cancelledAppointment);
    }

    public List<BusySlotResponse> getBusySlotsForEmployee(Long employeeId, LocalDate date){
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<Appointment> appointments = appointmentRepository.findAppointmentsForEmployeeByDate(employeeId, startOfDay, endOfDay);

        return appointments.stream()
                .map(app -> new BusySlotResponse(app.getStartTime(), app.getEndTime()))
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAllAppointments(){
        return appointmentMapper.toDtoList(appointmentRepository.findAll());
    }

    @Scheduled(cron = "0 0/15 * * * *")
    @Transactional
    public void autoCompletePastAppointments() {
        List<Appointment> toComplete = appointmentRepository.findByStatusInAndEndTimeBefore(
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED),
                LocalDateTime.now()
        );

        toComplete.forEach(a -> a.setStatus(AppointmentStatus.COMPLETED));
        appointmentRepository.saveAll(toComplete);
    }
}
