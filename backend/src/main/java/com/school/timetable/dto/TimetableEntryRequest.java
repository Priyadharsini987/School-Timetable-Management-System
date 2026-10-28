package com.school.timetable.dto;

import lombok.Data;

@Data
public class TimetableEntryRequest {
    private Long classId;
    private Long subjectId;
    private Long teacherId;
    private Long roomId;
    private Long periodId;
    private String day;
}
