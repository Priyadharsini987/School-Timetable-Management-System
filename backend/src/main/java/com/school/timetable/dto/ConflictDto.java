package com.school.timetable.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConflictDto {
    private String type; // TEACHER, ROOM, CLASS
    private String details;
}
