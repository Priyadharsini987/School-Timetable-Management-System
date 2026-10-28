package com.school.timetable.service;

import com.school.timetable.dto.PeriodRequest;
import com.school.timetable.entity.Period;
import com.school.timetable.exception.ResourceNotFoundException;
import com.school.timetable.repository.PeriodRepository;
import com.school.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PeriodService {

    private final PeriodRepository periodRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public List<Period> getAll() {
        return periodRepository.findAllByOrderByPeriodNumberAsc();
    }

    public Period getById(Long id) {
        return periodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found: " + id));
    }

    public Period create(PeriodRequest request) {
        Period period = new Period();
        period.setPeriodNumber(request.getPeriodNumber());
        period.setStartTime(request.getStartTime());
        period.setEndTime(request.getEndTime());
        return periodRepository.save(period);
    }

    public Period update(Long id, PeriodRequest request) {
        Period period = getById(id);
        period.setPeriodNumber(request.getPeriodNumber());
        period.setStartTime(request.getStartTime());
        period.setEndTime(request.getEndTime());
        return periodRepository.save(period);
    }

    @Transactional
    public void delete(Long id) {
        Period period = getById(id);
        timetableEntryRepository.deleteByPeriodId(id);
        periodRepository.delete(period);
    }
}
