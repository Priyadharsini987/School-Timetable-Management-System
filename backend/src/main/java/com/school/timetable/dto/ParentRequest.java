package com.school.timetable.dto;

import lombok.Data;

@Data
public class ParentRequest {
    private String name;
    private String email;
    private String phone;
    private String password; // used only on creation
}
