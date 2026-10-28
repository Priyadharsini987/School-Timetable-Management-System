package com.school.timetable.controller;

import com.school.timetable.dto.PeriodRequest;
import com.school.timetable.entity.Period;
import com.school.timetable.service.PeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/periods")
@RequiredArgsConstructor
public class PeriodController {

    private final PeriodService periodService;

    @GetMapping
    public List<Period> getAll() {
        return periodService.getAll();
    }

    @PostMapping
    public Period create(@RequestBody PeriodRequest request) {
        return periodService.create(request);
    }

    @PutMapping("/{id}")
    public Period update(@PathVariable Long id, @RequestBody PeriodRequest request) {
        return periodService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        periodService.delete(id);
    }
}
