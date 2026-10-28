package com.school.timetable.dto;

import lombok.Data;

import java.util.List;

@Data
public class TeacherRequest {
    private String name;
    private String email;
    private String phone;
    private String department;
    private String password; // used only on creation
    private List<Long> subjectIds;
}
