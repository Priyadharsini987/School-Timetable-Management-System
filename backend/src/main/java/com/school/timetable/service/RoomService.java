package com.school.timetable.service;

import com.school.timetable.dto.RoomRequest;
import com.school.timetable.entity.Room;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.RoomRepository;
import com.school.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public List<Room> getAll() {
        return roomRepository.findAll();
    }

    public Room getById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
    }

    public Room create(RoomRequest request) {
        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setCapacity(request.getCapacity());
        room.setType(request.getType());
        return roomRepository.save(room);
    }

    public Room update(Long id, RoomRequest request) {
        Room room = getById(id);
        room.setRoomNumber(request.getRoomNumber());
        room.setCapacity(request.getCapacity());
        room.setType(request.getType());
        return roomRepository.save(room);
    }

    @Transactional
    public void delete(Long id) {
        Room room = getById(id);
        timetableEntryRepository.deleteByRoomId(id);
        roomRepository.delete(room);
    }
}
