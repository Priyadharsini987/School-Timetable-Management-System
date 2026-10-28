package com.school.timetable.service;

import com.school.timetable.dto.SubjectRequest;
import com.school.timetable.entity.Subject;
import com.school.timetable.entity.Teacher;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.SubjectRepository;
import com.school.timetable.repository.TeacherRepository;
import com.school.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public List<Subject> getAll() {
        return subjectRepository.findAll();
    }

    public Subject getById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + id));
    }

    @Transactional
    public Subject create(SubjectRequest request) {
        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setCode(request.getCode());
        if (request.getPeriodsPerWeek() != null) {
            subject.setPeriodsPerWeek(request.getPeriodsPerWeek());
        } else {
            subject.setPeriodsPerWeek(5);
        }

        subject = subjectRepository.save(subject);
        linkTeachers(subject, request.getTeacherIds());
        return subject;
    }

    @Transactional
    public Subject update(Long id, SubjectRequest request) {
        Subject subject = getById(id);
        subject.setName(request.getName());
        subject.setCode(request.getCode());
        if (request.getPeriodsPerWeek() != null) {
            subject.setPeriodsPerWeek(request.getPeriodsPerWeek());
        } else {
            subject.setPeriodsPerWeek(5);
        }

        subject = subjectRepository.save(subject);
        linkTeachers(subject, request.getTeacherIds());
        return subject;
    }

    @Transactional
    public void delete(Long id) {
        Subject subject = getById(id);
        timetableEntryRepository.deleteBySubjectId(id);

        // Remove from teachers first to prevent foreign key constraint violation
        List<Teacher> teachers = teacherRepository.findAll();
        for (Teacher t : teachers) {
            if (t.getSubjects().contains(subject)) {
                t.getSubjects().remove(subject);
                teacherRepository.save(t);
            }
        }

        subjectRepository.delete(subject);
    }

    private void linkTeachers(Subject subject, List<Long> teacherIds) {
        if (teacherIds == null) {
            return;
        }

        for (Long teacherId : teacherIds) {
            teacherRepository.findById(teacherId).ifPresent(teacher -> {
                teacher.getSubjects().add(subject);
                teacherRepository.save(teacher);
            });
        }
    }
}
