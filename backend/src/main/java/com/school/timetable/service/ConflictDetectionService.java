package com.school.timetable.service;

import com.school.timetable.dto.ConflictDto;
import com.school.timetable.entity.TimetableEntry;
import com.school.timetable.entity.TimetableStatus;
import com.school.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Detects teacher / room / class double-booking conflicts across a set
 * of timetable entries. Used both while generating a timetable and
 * whenever the admin manually edits one.
 */
@Service
@RequiredArgsConstructor
public class ConflictDetectionService {

    private final TimetableEntryRepository timetableEntryRepository;

    public List<ConflictDto> detectAll(TimetableStatus status) {
        List<TimetableEntry> entries = timetableEntryRepository.findByStatus(status);
        return detect(entries);
    }

    public List<ConflictDto> detect(List<TimetableEntry> entries) {
        List<ConflictDto> conflicts = new ArrayList<>();

        Map<String, List<TimetableEntry>> byTeacherSlot = new HashMap<>();
        Map<String, List<TimetableEntry>> byRoomSlot = new HashMap<>();
        Map<String, List<TimetableEntry>> byClassSlot = new HashMap<>();

        for (TimetableEntry entry : entries) {
            String slot = entry.getDay() + "-" + entry.getPeriod().getId();

            String teacherKey = entry.getTeacher().getId() + "-" + slot;
            byTeacherSlot.computeIfAbsent(teacherKey, k -> new ArrayList<>()).add(entry);

            if (entry.getRoom() != null) {
                String roomKey = entry.getRoom().getId() + "-" + slot;
                byRoomSlot.computeIfAbsent(roomKey, k -> new ArrayList<>()).add(entry);
            }

            String classKey = entry.getSchoolClass().getId() + "-" + slot;
            byClassSlot.computeIfAbsent(classKey, k -> new ArrayList<>()).add(entry);
        }

        for (List<TimetableEntry> list : byTeacherSlot.values()) {
            if (list.size() > 1) {
                TimetableEntry first = list.get(0);
                String msg = String.format(
                        "Teacher %s is assigned to %d classes on %s, Period %d",
                        first.getTeacher().getName(), list.size(), first.getDay(), first.getPeriod().getPeriodNumber());
                conflicts.add(new ConflictDto("TEACHER", msg));
            }
        }

        for (List<TimetableEntry> list : byRoomSlot.values()) {
            if (list.size() > 1) {
                TimetableEntry first = list.get(0);
                String msg = String.format(
                        "Room %s is assigned to %d classes on %s, Period %d",
                        first.getRoom().getRoomNumber(), list.size(), first.getDay(), first.getPeriod().getPeriodNumber());
                conflicts.add(new ConflictDto("ROOM", msg));
            }
        }

        for (List<TimetableEntry> list : byClassSlot.values()) {
            if (list.size() > 1) {
                TimetableEntry first = list.get(0);
                String msg = String.format(
                        "Class %s has %d subjects assigned on %s, Period %d",
                        first.getSchoolClass().getClassName(), list.size(), first.getDay(), first.getPeriod().getPeriodNumber());
                conflicts.add(new ConflictDto("CLASS", msg));
            }
        }

        return conflicts;
    }
}
