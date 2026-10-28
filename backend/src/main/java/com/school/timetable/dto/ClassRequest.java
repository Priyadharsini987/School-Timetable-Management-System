package com.school.timetable.dto;

import lombok.Data;

import java.util.List;

@Data
public class ClassRequest {
    private String className;
    private String grade;
    private String section;
    private List<Long> subjectIds;
}
