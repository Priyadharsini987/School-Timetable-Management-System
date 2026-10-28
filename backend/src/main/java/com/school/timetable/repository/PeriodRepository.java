package com.school.timetable.repository;

import com.school.timetable.entity.Period;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeriodRepository extends JpaRepository<Period, Long> {
    List<Period> findAllByOrderByPeriodNumberAsc();
}
