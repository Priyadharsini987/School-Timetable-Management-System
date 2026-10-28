package com.school.timetable.repository;

import com.school.timetable.entity.DayOfWeekEnum;
import com.school.timetable.entity.TimetableEntry;
import com.school.timetable.entity.TimetableStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {

    List<TimetableEntry> findBySchoolClassIdAndStatus(Long classId, TimetableStatus status);

    List<TimetableEntry> findByTeacherIdAndStatus(Long teacherId, TimetableStatus status);

    List<TimetableEntry> findBySchoolClassId(Long classId);

    List<TimetableEntry> findByStatus(TimetableStatus status);

    void deleteBySchoolClassIdAndStatus(Long classId, TimetableStatus status);
    
    void deleteByTeacherId(Long teacherId);
    void deleteBySchoolClassId(Long classId);
    void deleteByRoomId(Long roomId);
    void deleteByPeriodId(Long periodId);
    void deleteBySubjectId(Long subjectId);

    List<TimetableEntry> findByTeacherIdAndDayAndPeriodIdAndStatus(
            Long teacherId, DayOfWeekEnum day, Long periodId, TimetableStatus status);

    List<TimetableEntry> findByRoomIdAndDayAndPeriodIdAndStatus(
            Long roomId, DayOfWeekEnum day, Long periodId, TimetableStatus status);

    List<TimetableEntry> findBySchoolClassIdAndDayAndPeriodIdAndStatus(
            Long classId, DayOfWeekEnum day, Long periodId, TimetableStatus status);
}
