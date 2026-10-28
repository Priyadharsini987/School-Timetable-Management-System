package com.school.timetable.dto;

import lombok.Data;

@Data
public class RoomRequest {
    private String roomNumber;
    private Integer capacity;
    private String type;
}
