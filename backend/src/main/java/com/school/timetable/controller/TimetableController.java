package com.school.timetable.controller;

import com.school.timetable.dto.ConflictDto;
import com.school.timetable.dto.TimetableEntryRequest;
import com.school.timetable.dto.TimetableGenerateRequest;
import com.school.timetable.entity.TimetableEntry;
import com.school.timetable.entity.TimetableStatus;
import com.school.timetable.repository.ParentRepository;
import com.school.timetable.repository.StudentRepository;
import com.school.timetable.repository.TeacherRepository;
import com.school.timetable.service.ConflictDetectionService;
import com.school.timetable.service.TimetableGeneratorService;
import com.school.timetable.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;
    private final TimetableGeneratorService generatorService;
    private final ConflictDetectionService conflictDetectionService;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;

    @GetMapping("/class/{classId}")
    public List<TimetableEntry> getByClass(@PathVariable Long classId,
                                            @RequestParam(defaultValue = "PUBLISHED") TimetableStatus status) {
        return timetableService.getByClass(classId, status);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<TimetableEntry> getByTeacher(@PathVariable Long teacherId,
                                              @RequestParam(defaultValue = "PUBLISHED") TimetableStatus status) {
        return timetableService.getByTeacher(teacherId, status);
    }

    /** Convenience endpoint: the logged-in teacher's own timetable */
    @GetMapping("/my/teacher")
    public List<TimetableEntry> myTeacherTimetable(Authentication authentication) {
        String email = authentication.getName();
        var teacher = teacherRepository.findByEmail(email).orElseThrow();
        return timetableService.getByTeacher(teacher.getId(), TimetableStatus.PUBLISHED);
    }

    /** Convenience endpoint: the logged-in student's own class timetable */
    @GetMapping("/my/student")
    public List<TimetableEntry> myStudentTimetable(Authentication authentication) {
        String email = authentication.getName();
        var student = studentRepository.findAll().stream()
                .filter(s -> s.getEmail().equalsIgnoreCase(email))
                .findFirst().orElseThrow();
        return timetableService.getByClass(student.getSchoolClass().getId(), TimetableStatus.PUBLISHED);
    }

    /** Convenience endpoint: the logged-in parent's child's timetable (first child) */
    @GetMapping("/my/parent")
    public List<TimetableEntry> myParentTimetable(Authentication authentication) {
        String email = authentication.getName();
        var parent = parentRepository.findAll().stream()
                .filter(p -> p.getEmail().equalsIgnoreCase(email))
                .findFirst().orElseThrow();
        var child = parent.getChildren().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No child linked to this parent account"));
        return timetableService.getByClass(child.getSchoolClass().getId(), TimetableStatus.PUBLISHED);
    }

    @PostMapping("/generate")
    public TimetableGeneratorService.GenerationResult generate(@RequestBody TimetableGenerateRequest request) {
        return generatorService.generate(request);
    }

    @PostMapping
    public TimetableEntry create(@RequestBody TimetableEntryRequest request) {
        return timetableService.createEntry(request);
    }

    @PutMapping("/{id}")
    public TimetableEntry update(@PathVariable Long id, @RequestBody TimetableEntryRequest request) {
        return timetableService.updateEntry(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        timetableService.deleteEntry(id);
    }

    @GetMapping("/conflicts")
    public List<ConflictDto> conflicts(@RequestParam(defaultValue = "DRAFT") TimetableStatus status) {
        return conflictDetectionService.detectAll(status);
    }

    @PostMapping("/publish/{classId}")
    public Map<String, String> publish(@PathVariable Long classId) {
        timetableService.publish(classId);
        return Map.of("message", "Timetable published successfully.");
    }

    @DeleteMapping("/class/{classId}")
    public Map<String, String> deletePublished(@PathVariable Long classId) {
        timetableService.deletePublishedByClass(classId);
        return Map.of("message", "Published timetable deleted successfully.");
    }
}
