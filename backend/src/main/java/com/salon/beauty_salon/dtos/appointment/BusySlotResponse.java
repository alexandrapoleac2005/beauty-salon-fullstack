package com.salon.beauty_salon.dtos.appointment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class BusySlotResponse {

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
