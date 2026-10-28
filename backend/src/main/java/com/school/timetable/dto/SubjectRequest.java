package com.school.timetable.dto;

import lombok.Data;

import java.util.List;

@Data
public class SubjectRequest {
    private String name;
    private String code;
    private Integer periodsPerWeek;
    private List<Long> teacherIds;
}
