package com.school.timetable.controller;

import com.school.timetable.entity.TimetableEntry;
import com.school.timetable.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/class/{classId}")
    public List<TimetableEntry> classReport(@PathVariable Long classId) {
        return reportService.classTimetableReport(classId);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<TimetableEntry> teacherReport(@PathVariable Long teacherId) {
        return reportService.teacherScheduleReport(teacherId);
    }

    @GetMapping("/subject-allocation/{classId}")
    public Map<String, Long> subjectAllocation(@PathVariable Long classId) {
        return reportService.subjectAllocationReport(classId);
    }

    @GetMapping("/conflicts")
    public Map<String, Object> conflictReport() {
        return reportService.conflictReport();
    }
}
