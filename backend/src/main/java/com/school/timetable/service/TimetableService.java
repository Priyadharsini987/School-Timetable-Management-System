package com.school.timetable.service;

import com.school.timetable.dto.TimetableEntryRequest;
import com.school.timetable.entity.*;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Handles viewing, manual editing, and the draft -> published workflow
 * for timetables.
 */
@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableEntryRepository timetableEntryRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final PeriodRepository periodRepository;
    private final ConflictDetectionService conflictDetectionService;

    public List<TimetableEntry> getByClass(Long classId, TimetableStatus status) {
        return timetableEntryRepository.findBySchoolClassIdAndStatus(classId, status);
    }

    public List<TimetableEntry> getByClassAllStatuses(Long classId) {
        return timetableEntryRepository.findBySchoolClassId(classId);
    }

    public List<TimetableEntry> getByTeacher(Long teacherId, TimetableStatus status) {
        return timetableEntryRepository.findByTeacherIdAndStatus(teacherId, status);
    }

    public TimetableEntry getEntry(Long id) {
        return timetableEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found: " + id));
    }

    @Transactional
    public TimetableEntry updateEntry(Long id, TimetableEntryRequest request) {
        TimetableEntry entry = getEntry(id);

        if (request.getSubjectId() != null) {
            entry.setSubject(subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found")));
        }
        if (request.getTeacherId() != null) {
            entry.setTeacher(teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found")));
        }
        if (request.getRoomId() != null) {
            entry.setRoom(roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found")));
        }
        if (request.getPeriodId() != null) {
            entry.setPeriod(periodRepository.findById(request.getPeriodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Period not found")));
        }
        if (request.getDay() != null) {
            entry.setDay(DayOfWeekEnum.valueOf(request.getDay().toUpperCase()));
        }

        return timetableEntryRepository.save(entry);
    }

    @Transactional
    public TimetableEntry createEntry(TimetableEntryRequest request) {
        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        
        Room room = null;
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId()).orElse(null);
        }

        Period period = periodRepository.findById(request.getPeriodId())
                .orElseThrow(() -> new ResourceNotFoundException("Period not found"));

        TimetableEntry entry = new TimetableEntry();
        entry.setSchoolClass(schoolClass);
        entry.setSubject(subject);
        entry.setTeacher(teacher);
        entry.setRoom(room);
        entry.setPeriod(period);
        entry.setDay(DayOfWeekEnum.valueOf(request.getDay().toUpperCase()));
        entry.setStatus(TimetableStatus.DRAFT);

        return timetableEntryRepository.save(entry);
    }

    public void deleteEntry(Long id) {
        timetableEntryRepository.delete(getEntry(id));
    }

    @Transactional
    public void publish(Long classId) {
        List<TimetableEntry> draft = timetableEntryRepository.findBySchoolClassIdAndStatus(classId, TimetableStatus.DRAFT);
        if (draft.isEmpty()) {
            throw new IllegalArgumentException("No draft timetable found for this class. Generate one first.");
        }

        var conflicts = conflictDetectionService.detect(draft);
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Cannot publish: " + conflicts.size() + " unresolved conflict(s) exist. Resolve them first.");
        }

        // remove any previously published timetable for this class, then promote the draft
        timetableEntryRepository.deleteBySchoolClassIdAndStatus(classId, TimetableStatus.PUBLISHED);
        for (TimetableEntry entry : draft) {
            entry.setStatus(TimetableStatus.PUBLISHED);
        }
        timetableEntryRepository.saveAll(draft);
    }

    @Transactional
    public void deletePublishedByClass(Long classId) {
        timetableEntryRepository.deleteBySchoolClassIdAndStatus(classId, TimetableStatus.PUBLISHED);
    }
}
