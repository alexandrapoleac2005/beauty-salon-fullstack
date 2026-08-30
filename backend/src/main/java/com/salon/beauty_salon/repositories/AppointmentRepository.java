package com.salon.beauty_salon.repositories;

import com.salon.beauty_salon.entities.Appointment;
import com.salon.beauty_salon.entities.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.tags.form.SelectTag;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByClientId(Long clientId);

    List<Appointment> findByEmployeeId(Long employeeId);

    @Query("SELECT COUNT (a) > 0 FROM Appointment a WHERE a.employee.id = :employeeId " +
            "AND a.status != 'CANCELLED' " +
            "AND a.startTime < :endTime AND a.endTime > :startTime")
    boolean hasOverlappingAppointments(@Param("employeeId") Long employeeId,
                                       @Param("startTime")LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);


    @Query("SELECT COUNT (a) > 0 FROM Appointment a WHERE a.employee.id = :employeeId " +
            "AND a.id != :appointmentId " +
            "AND a.status != 'CANCELLED' " +
            "AND a.startTime < :endTime AND a.endTime > :startTime")
    boolean hasOverlappingAppointmentsForReschedule(@Param("employeeId") Long employeeId,
                                                    @Param("appointmentId") Long appointmentId,
                                                    @Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime);


    @Query("SELECT a FROM Appointment a WHERE a.employee.id = :employeeId " +
            "AND a.status != 'CANCELLED' " +
            "AND a.startTime >= :startOfDay AND a.startTime <= :endOfDay")
    List<Appointment> findAppointmentsForEmployeeByDate(
            @Param("employeeId") Long employeeId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    List<Appointment> findByStatusInAndEndTimeBefore(List<AppointmentStatus> statuses, LocalDateTime time);

}
