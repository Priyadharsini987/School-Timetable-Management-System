package com.school.timetable.controller;

import com.school.timetable.dto.ClassRequest;
import com.school.timetable.entity.SchoolClass;
import com.school.timetable.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public List<SchoolClass> getAll() {
        return classService.getAll();
    }

    @GetMapping("/{id}")
    public SchoolClass getById(@PathVariable Long id) {
        return classService.getById(id);
    }

    @PostMapping
    public SchoolClass create(@RequestBody ClassRequest request) {
        return classService.create(request);
    }

    @PutMapping("/{id}")
    public SchoolClass update(@PathVariable Long id, @RequestBody ClassRequest request) {
        return classService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        classService.delete(id);
    }
}
