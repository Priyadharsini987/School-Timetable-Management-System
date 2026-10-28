package com.school.timetable.dto;

import lombok.Data;

@Data
public class StudentRequest {
    private String name;
    private String rollNo;
    private String email;
    private String password; // used only on creation
    private Long classId;
    private Long parentId;
}
