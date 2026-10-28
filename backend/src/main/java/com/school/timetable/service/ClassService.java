package com.school.timetable.service;

import com.school.timetable.dto.ClassRequest;
import com.school.timetable.entity.SchoolClass;
import com.school.timetable.entity.Subject;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.SchoolClassRepository;
import com.school.timetable.repository.SubjectRepository;
import com.school.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public List<SchoolClass> getAll() {
        return schoolClassRepository.findAll();
    }

    public SchoolClass getById(Long id) {
        return schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + id));
    }

    @Transactional
    public SchoolClass create(ClassRequest request) {
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setClassName(request.getClassName());
        schoolClass.setGrade(request.getGrade());
        schoolClass.setSection(request.getSection());
        schoolClass.setSubjects(resolveSubjects(request.getSubjectIds()));

        return schoolClassRepository.save(schoolClass);
    }

    @Transactional
    public SchoolClass update(Long id, ClassRequest request) {
        SchoolClass schoolClass = getById(id);
        schoolClass.setClassName(request.getClassName());
        schoolClass.setGrade(request.getGrade());
        schoolClass.setSection(request.getSection());
        schoolClass.setSubjects(resolveSubjects(request.getSubjectIds()));

        return schoolClassRepository.save(schoolClass);
    }

    @Transactional
    public void delete(Long id) {
        SchoolClass schoolClass = getById(id);
        timetableEntryRepository.deleteBySchoolClassId(id);
        schoolClassRepository.delete(schoolClass);
    }

    private Set<Subject> resolveSubjects(List<Long> subjectIds) {
        Set<Subject> subjects = new HashSet<>();

        if (subjectIds != null) {
            for (Long subjectId : subjectIds) {
                subjectRepository.findById(subjectId).ifPresent(subject -> subjects.add(subject));
            }
        }

        return subjects;
    }
}
