package com.school.timetable.service;

import com.school.timetable.dto.TeacherRequest;
import com.school.timetable.entity.Role;
import com.school.timetable.entity.Subject;
import com.school.timetable.entity.Teacher;
import com.school.timetable.entity.User;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.SubjectRepository;
import com.school.timetable.repository.TeacherRepository;
import com.school.timetable.repository.TimetableEntryRepository;
import com.school.timetable.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Teacher> getAll() {
        return teacherRepository.findAll();
    }

    public Teacher getById(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + id));
    }

    @Transactional
    public Teacher create(TeacherRequest request) {
        String rawPassword;
        if (request.getPassword() != null) {
            rawPassword = request.getPassword();
        } else {
            rawPassword = "Teacher@123";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.TEACHER);
        user.setEnabled(true);
        user = userRepository.save(user);

        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setName(request.getName());
        teacher.setEmail(request.getEmail());
        teacher.setPhone(request.getPhone());
        teacher.setDepartment(request.getDepartment());
        teacher.setSubjects(resolveSubjects(request.getSubjectIds()));

        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher update(Long id, TeacherRequest request) {
        Teacher teacher = getById(id);
        teacher.setName(request.getName());
        teacher.setEmail(request.getEmail());
        teacher.setPhone(request.getPhone());
        teacher.setDepartment(request.getDepartment());
        teacher.setSubjects(resolveSubjects(request.getSubjectIds()));

        if (teacher.getUser() != null) {
            teacher.getUser().setName(request.getName());
            teacher.getUser().setEmail(request.getEmail());
        }

        return teacherRepository.save(teacher);
    }

    @Transactional
    public void delete(Long id) {
        Teacher teacher = getById(id);
        User user = teacher.getUser();

        timetableEntryRepository.deleteByTeacherId(id);
        teacherRepository.delete(teacher);

        if (user != null) {
            userRepository.delete(user);
        }
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
