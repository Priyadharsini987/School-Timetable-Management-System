package com.school.timetable.service;

import com.school.timetable.dto.ParentRequest;
import com.school.timetable.entity.Parent;
import com.school.timetable.entity.Role;
import com.school.timetable.entity.User;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.ParentRepository;
import com.school.timetable.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Parent> getAll() {
        return parentRepository.findAll();
    }

    public Parent getById(Long id) {
        return parentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found: " + id));
    }

    @Transactional
    public Parent create(ParentRequest request) {
        String rawPassword;
        if (request.getPassword() != null) {
            rawPassword = request.getPassword();
        } else {
            rawPassword = "Parent@123";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.PARENT);
        user.setEnabled(true);
        user = userRepository.save(user);

        Parent parent = new Parent();
        parent.setUser(user);
        parent.setName(request.getName());
        parent.setEmail(request.getEmail());
        parent.setPhone(request.getPhone());

        return parentRepository.save(parent);
    }

    @Transactional
    public Parent update(Long id, ParentRequest request) {
        Parent parent = getById(id);
        parent.setName(request.getName());
        parent.setEmail(request.getEmail());
        parent.setPhone(request.getPhone());

        if (parent.getUser() != null) {
            parent.getUser().setName(request.getName());
            parent.getUser().setEmail(request.getEmail());
        }

        return parentRepository.save(parent);
    }

    @Transactional
    public void delete(Long id) {
        Parent parent = getById(id);
        User user = parent.getUser();

        parentRepository.delete(parent);

        if (user != null) {
            userRepository.delete(user);
        }
    }
}
