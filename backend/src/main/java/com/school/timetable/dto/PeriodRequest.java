package com.school.timetable.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class PeriodRequest {
    private Integer periodNumber;
    private LocalTime startTime;
    private LocalTime endTime;
}
