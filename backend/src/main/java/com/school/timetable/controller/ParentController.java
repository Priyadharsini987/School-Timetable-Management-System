package com.school.timetable.controller;

import com.school.timetable.dto.ParentRequest;
import com.school.timetable.entity.Parent;
import com.school.timetable.service.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping
    public List<Parent> getAll() {
        return parentService.getAll();
    }

    @GetMapping("/{id}")
    public Parent getById(@PathVariable Long id) {
        return parentService.getById(id);
    }

    @PostMapping
    public Parent create(@RequestBody ParentRequest request) {
        return parentService.create(request);
    }

    @PutMapping("/{id}")
    public Parent update(@PathVariable Long id, @RequestBody ParentRequest request) {
        return parentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        parentService.delete(id);
    }
}
