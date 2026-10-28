package com.school.timetable.service;

import com.school.timetable.dto.TimetableGenerateRequest;
import com.school.timetable.entity.*;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Rule-based (constraint-based greedy) timetable generation algorithm.
 *
 * Steps (matches the SRS description):
 *  1. Get all subjects assigned to the selected class.
 *  2. For each subject, find a teacher who teaches it.
 *  3. Build the list of available (day, period) slots.
 *  4. For each subject, repeat "periodsPerWeek" times:
 *       - try the next free slot where the class, the teacher AND a room
 *         are all free at that time
 *       - if no slot works, skip and report it (rather than double booking)
 *  5. Persist all entries as DRAFT so the admin can review / edit / publish.
 */
@Service
@RequiredArgsConstructor
public class TimetableGeneratorService {

    private final SchoolClassRepository schoolClassRepository;
    private final PeriodRepository periodRepository;
    private final RoomRepository roomRepository;
    private final TeacherRepository teacherRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final ConflictDetectionService conflictDetectionService;

    @Transactional
    public GenerationResult generate(TimetableGenerateRequest request) {
        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + request.getClassId()));

        // Step 0: wipe any previous DRAFT for this class so re-generating is clean
        timetableEntryRepository.deleteBySchoolClassIdAndStatus(schoolClass.getId(), TimetableStatus.DRAFT);

        List<DayOfWeekEnum> workingDays = new ArrayList<>();
        if (request.getWorkingDays() != null && !request.getWorkingDays().isEmpty()) {
            for (String dayStr : request.getWorkingDays()) {
                workingDays.add(DayOfWeekEnum.valueOf(dayStr.toUpperCase()));
            }
        } else {
            workingDays.add(DayOfWeekEnum.MONDAY);
            workingDays.add(DayOfWeekEnum.TUESDAY);
            workingDays.add(DayOfWeekEnum.WEDNESDAY);
            workingDays.add(DayOfWeekEnum.THURSDAY);
            workingDays.add(DayOfWeekEnum.FRIDAY);
        }

        int periodsPerDay = 6;
        if (request.getPeriodsPerDay() != null) {
            periodsPerDay = request.getPeriodsPerDay();
        }

        List<Period> allPeriods = periodRepository.findAllByOrderByPeriodNumberAsc();
        List<Period> periods = new ArrayList<>();
        for (int i = 0; i < allPeriods.size() && i < periodsPerDay; i++) {
            periods.add(allPeriods.get(i));
        }

        if (periods.isEmpty()) {
            throw new IllegalArgumentException("No periods configured. Please add periods first.");
        }

        List<Room> rooms = roomRepository.findAll();

        // Step 1: subjects for this class
        Set<Subject> subjects = schoolClass.getSubjects();
        if (subjects.isEmpty()) {
            throw new IllegalArgumentException("This class has no subjects assigned. Assign subjects first.");
        }

        // Build the full slot grid: day x period
        List<Slot> allSlots = new ArrayList<>();
        for (DayOfWeekEnum day : workingDays) {
            for (Period period : periods) {
                allSlots.add(new Slot(day, period));
            }
        }

        // Track what's occupied as we build, so we can check conflicts live
        Set<String> classOccupied = new HashSet<>();
        Set<String> teacherOccupied = new HashSet<>();
        Set<String> roomOccupied = new HashSet<>();

        // Load existing entries from DB to avoid double-booking across different classes
        List<TimetableEntry> existingEntries = timetableEntryRepository.findAll();
        for (TimetableEntry entry : existingEntries) {
            String slotKey = entry.getDay() + "-" + entry.getPeriod().getId();
            if (entry.getSchoolClass() != null) {
                classOccupied.add(entry.getSchoolClass().getId() + "-" + slotKey);
            }
            if (entry.getTeacher() != null) {
                teacherOccupied.add(entry.getTeacher().getId() + "-" + slotKey);
            }
            if (entry.getRoom() != null) {
                roomOccupied.add(entry.getRoom().getId() + "-" + slotKey);
            }
        }

        List<TimetableEntry> generatedEntries = new ArrayList<>();
        List<String> unscheduledSubjects = new ArrayList<>();

        List<Teacher> allTeachers = teacherRepository.findAll();

        for (Subject subject : subjects) {
            // Step 2: find a teacher assigned to this subject
            Teacher teacher = pickTeacherForSubject(subject, allTeachers);

            if (teacher == null) {
                unscheduledSubjects.add(subject.getName() + " (no teacher assigned)");
                continue;
            }

            int required = 5;
            if (subject.getPeriodsPerWeek() != null) {
                required = subject.getPeriodsPerWeek();
            }
            int scheduled = 0;

            for (Slot slot : allSlots) {
                if (scheduled >= required) {
                    break;
                }

                String slotKey = slot.day + "-" + slot.period.getId();
                String classSlotKey = schoolClass.getId() + "-" + slotKey;
                String teacherSlotKey = teacher.getId() + "-" + slotKey;

                if (classOccupied.contains(classSlotKey)) {
                    continue; // class already has a subject here
                }
                if (teacherOccupied.contains(teacherSlotKey)) {
                    continue; // teacher busy elsewhere
                }

                // Step 4: find a free room
                Room chosenRoom = null;
                for (Room room : rooms) {
                    String roomSlotKey = room.getId() + "-" + slotKey;
                    if (!roomOccupied.contains(roomSlotKey)) {
                        chosenRoom = room;
                        break;
                    }
                }
                if (rooms.isEmpty()) {
                    chosenRoom = null; // rooms optional
                } else if (chosenRoom == null) {
                    continue; // no free room this slot, try next slot
                }

                TimetableEntry entry = new TimetableEntry();
                entry.setSchoolClass(schoolClass);
                entry.setSubject(subject);
                entry.setTeacher(teacher);
                entry.setRoom(chosenRoom);
                entry.setPeriod(slot.period);
                entry.setDay(slot.day);
                entry.setStatus(TimetableStatus.DRAFT);

                generatedEntries.add(entry);

                classOccupied.add(classSlotKey);
                teacherOccupied.add(teacherSlotKey);
                if (chosenRoom != null) {
                    roomOccupied.add(chosenRoom.getId() + "-" + slotKey);
                }
                scheduled++;
            }

            if (scheduled < required) {
                unscheduledSubjects.add(subject.getName() + " (" + scheduled + "/" + required + " periods placed - not enough free slots)");
            }
        }

        timetableEntryRepository.saveAll(generatedEntries);

        var conflicts = conflictDetectionService.detect(generatedEntries);

        return new GenerationResult(generatedEntries, conflicts, unscheduledSubjects);
    }

    private Teacher pickTeacherForSubject(Subject subject, List<Teacher> allTeachers) {
        for (Teacher teacher : allTeachers) {
            for (Subject s : teacher.getSubjects()) {
                if (s.getId().equals(subject.getId())) {
                    return teacher;
                }
            }
        }
        return null;
    }

    private record Slot(DayOfWeekEnum day, Period period) {}

    public record GenerationResult(
            List<TimetableEntry> entries,
            List<com.school.timetable.dto.ConflictDto> conflicts,
            List<String> unscheduledSubjects) {}
}
