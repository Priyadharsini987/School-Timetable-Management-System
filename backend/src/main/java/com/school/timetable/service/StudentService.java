package com.school.timetable.service;

import com.school.timetable.dto.StudentRequest;
import com.school.timetable.entity.*;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    public Student getById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
    }

    public List<Student> getByClass(Long classId) {
        return studentRepository.findBySchoolClassId(classId);
    }

    @Transactional
    public Student create(StudentRequest request) {
        String rawPassword;
        if (request.getPassword() != null) {
            rawPassword = request.getPassword();
        } else {
            rawPassword = "Student@123";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.STUDENT);
        user.setEnabled(true);
        user = userRepository.save(user);

        SchoolClass schoolClass = null;
        if (request.getClassId() != null) {
            schoolClass = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + request.getClassId()));
        }

        Parent parent = null;
        if (request.getParentId() != null) {
            parent = parentRepository.findById(request.getParentId()).orElse(null);
        }

        Student student = new Student();
        student.setUser(user);
        student.setName(request.getName());
        student.setRollNo(request.getRollNo());
        student.setEmail(request.getEmail());
        student.setSchoolClass(schoolClass);
        student.setParent(parent);

        return studentRepository.save(student);
    }

    @Transactional
    public Student update(Long id, StudentRequest request) {
        Student student = getById(id);
        student.setName(request.getName());
        student.setRollNo(request.getRollNo());
        student.setEmail(request.getEmail());

        if (request.getClassId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + request.getClassId()));
            student.setSchoolClass(schoolClass);
        }

        if (request.getParentId() != null) {
            parentRepository.findById(request.getParentId()).ifPresent(parent -> student.setParent(parent));
        }

        if (student.getUser() != null) {
            student.getUser().setName(request.getName());
            student.getUser().setEmail(request.getEmail());
        }

        return studentRepository.save(student);
    }

    @Transactional
    public void delete(Long id) {
        Student student = getById(id);
        User user = student.getUser();

        studentRepository.delete(student);

        if (user != null) {
            userRepository.delete(user);
        }
    }
}
