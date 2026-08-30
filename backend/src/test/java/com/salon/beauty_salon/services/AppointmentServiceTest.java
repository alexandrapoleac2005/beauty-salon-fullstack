package com.salon.beauty_salon.services;

import com.salon.beauty_salon.dtos.appointment.*;
import com.salon.beauty_salon.entities.*;
import com.salon.beauty_salon.exceptions.*;
import com.salon.beauty_salon.mappers.AppointmentMapper;
import com.salon.beauty_salon.repositories.AppointmentRepository;
import com.salon.beauty_salon.repositories.SalonServiceRepository;
import com.salon.beauty_salon.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SalonServiceRepository salonServiceRepository;
    @Mock
    private AppointmentMapper appointmentMapper;
    @Mock
    private MailService mailService;

    @InjectMocks
    private AppointmentService appointmentService;

    private User client;
    private User employee;
    private SalonService salonService;
    private AppointmentCreateRequest createRequest;
    private LocalDateTime validStartTime;

    @BeforeEach
    void setUp() {
        client = new User();
        client.setId(1L);
        client.setEmail("client@salon.com");
        client.setFirstName("Client");

        employee = new User();
        employee.setId(2L);
        employee.setRole(Role.EMPLOYEE);
        employee.setFirstName("Angajat");
        employee.setLastName("Popescu");

        salonService = new SalonService();
        salonService.setId(1L);
        salonService.setName("Tuns");
        salonService.setDurationMinutes(30);

        validStartTime = LocalDateTime.of(2024, 4, 15, 10, 0);

        createRequest = new AppointmentCreateRequest();
        createRequest.setEmployeeId(2L);
        createRequest.setServiceId(1L);
        createRequest.setStartTime(validStartTime);
    }

    @Test
    void createAppointment_WhenValid_ShouldCreateAndSendEmail() {
        Appointment savedAppointment = new Appointment();
        savedAppointment.setId(1L);
        savedAppointment.setStartTime(validStartTime);

        AppointmentResponse expectedResponse = new AppointmentResponse();
        expectedResponse.setId(1L);

        when(userRepository.findByEmail("client@salon.com")).thenReturn(Optional.of(client));
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(salonServiceRepository.findById(1L)).thenReturn(Optional.of(salonService));
        when(appointmentRepository.hasOverlappingAppointments(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(false);

        when(appointmentMapper.toEntity(createRequest)).thenReturn(new Appointment());
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);
        when(appointmentMapper.toDto(savedAppointment)).thenReturn(expectedResponse);

        AppointmentResponse actualResponse = appointmentService.createAppointment("client@salon.com", createRequest);

        assertNotNull(actualResponse);
        assertEquals(1L, actualResponse.getId());

        verify(mailService, times(1)).sendAppointmentConfirmation(
                eq(client.getEmail()), eq(client.getFirstName()), eq(salonService.getName()),
                eq(employee.getFirstName()), eq(employee.getLastName()), eq(validStartTime)
        );
    }

    @Test
    void createAppointment_WhenSunday_ShouldThrowSalonClosedException() {

        createRequest.setStartTime(LocalDateTime.of(2024, 4, 14, 10, 0));

        when(userRepository.findByEmail("client@salon.com")).thenReturn(Optional.of(client));
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(salonServiceRepository.findById(1L)).thenReturn(Optional.of(salonService));

        assertThrows(SalonClosedException.class, () -> {
            appointmentService.createAppointment("client@salon.com", createRequest);
        });
    }

    @Test
    void createAppointment_WhenOverlapping_ShouldThrowException() {
        when(userRepository.findByEmail("client@salon.com")).thenReturn(Optional.of(client));
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(salonServiceRepository.findById(1L)).thenReturn(Optional.of(salonService));

        when(appointmentRepository.hasOverlappingAppointments(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(true);

        assertThrows(IsOverlappedException.class, () -> {
            appointmentService.createAppointment("client@salon.com", createRequest);
        });
    }

    @Test
    void createAppointment_WhenUserIsNotEmployee_ShouldThrowException() {
        employee.setRole(Role.CLIENT);

        when(userRepository.findByEmail("client@salon.com")).thenReturn(Optional.of(client));
        when(userRepository.findById(2L)).thenReturn(Optional.of(employee));

        assertThrows(InvalidRoleException.class, () -> {
            appointmentService.createAppointment("client@salon.com", createRequest);
        });
    }

    @Test
    void cancelAppointment_ShouldSetStatusToCancelled() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        AppointmentResponse expectedResponse = new AppointmentResponse();
        expectedResponse.setStatus(AppointmentStatus.CANCELLED);
        when(appointmentMapper.toDto(appointment)).thenReturn(expectedResponse);

        AppointmentResponse result = appointmentService.cancelAppointment(1L);

        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
        assertEquals(AppointmentStatus.CANCELLED, result.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void getBusySlotsForEmployee_ShouldReturnMappedSlots() {
        LocalDate date = LocalDate.of(2024, 4, 15);
        Appointment app1 = new Appointment();
        app1.setStartTime(LocalDateTime.of(2024, 4, 15, 10, 0));
        app1.setEndTime(LocalDateTime.of(2024, 4, 15, 10, 30));

        when(appointmentRepository.findAppointmentsForEmployeeByDate(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(app1));

        List<BusySlotResponse> busySlots = appointmentService.getBusySlotsForEmployee(2L, date);

        assertEquals(1, busySlots.size());
        assertEquals(app1.getStartTime(), busySlots.get(0).getStartTime());
        assertEquals(app1.getEndTime(), busySlots.get(0).getEndTime());
    }

    @Test
    void autoCompletePastAppointments_ShouldUpdateStatus() {
        Appointment pastAppointment = new Appointment();
        pastAppointment.setStatus(AppointmentStatus.PENDING);

        when(appointmentRepository.findByStatusInAndEndTimeBefore(anyList(), any(LocalDateTime.class)))
                .thenReturn(List.of(pastAppointment));

        appointmentService.autoCompletePastAppointments();

        assertEquals(AppointmentStatus.COMPLETED, pastAppointment.getStatus());
        verify(appointmentRepository, times(1)).saveAll(anyList());
    }
}