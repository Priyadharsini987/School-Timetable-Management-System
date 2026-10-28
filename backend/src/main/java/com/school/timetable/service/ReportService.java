package com.school.timetable.service;

import com.school.timetable.dto.ConflictDto;
import com.school.timetable.entity.TimetableEntry;
import com.school.timetable.entity.TimetableStatus;
import com.school.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TimetableEntryRepository timetableEntryRepository;
    private final ConflictDetectionService conflictDetectionService;

    public List<TimetableEntry> classTimetableReport(Long classId) {
        return timetableEntryRepository.findBySchoolClassIdAndStatus(classId, TimetableStatus.PUBLISHED);
    }

    public List<TimetableEntry> teacherScheduleReport(Long teacherId) {
        return timetableEntryRepository.findByTeacherIdAndStatus(teacherId, TimetableStatus.PUBLISHED);
    }

    public Map<String, Long> subjectAllocationReport(Long classId) {
        List<TimetableEntry> entries = timetableEntryRepository.findBySchoolClassIdAndStatus(classId, TimetableStatus.PUBLISHED);
        
        Map<String, Long> counts = new HashMap<>();
        for (TimetableEntry entry : entries) {
            String subjectName = entry.getSubject().getName();
            long currentCount = counts.getOrDefault(subjectName, 0L);
            counts.put(subjectName, currentCount + 1L);
        }
        return counts;
    }

    public Map<String, Object> conflictReport() {
        List<ConflictDto> conflicts = conflictDetectionService.detectAll(TimetableStatus.PUBLISHED);

        long teacherConflicts = 0;
        long classConflicts = 0;
        long roomConflicts = 0;

        for (ConflictDto conflict : conflicts) {
            if ("TEACHER".equals(conflict.getType())) {
                teacherConflicts++;
            } else if ("CLASS".equals(conflict.getType())) {
                classConflicts++;
            } else if ("ROOM".equals(conflict.getType())) {
                roomConflicts++;
            }
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalConflicts", conflicts.size());
        report.put("teacherConflicts", teacherConflicts);
        report.put("classConflicts", classConflicts);
        report.put("roomConflicts", roomConflicts);
        report.put("details", conflicts);
        return report;
    }
}
