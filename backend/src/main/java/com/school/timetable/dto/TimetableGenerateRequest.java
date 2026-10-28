package com.school.timetable.dto;

import lombok.Data;

import java.util.List;

@Data
public class TimetableGenerateRequest {
    private Long classId;
    private List<String> workingDays; // e.g. ["MONDAY","TUESDAY",...]
    private Integer periodsPerDay;
}
