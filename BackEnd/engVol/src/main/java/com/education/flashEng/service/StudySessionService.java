package com.education.flashEng.service;

import com.education.flashEng.entity.StudySessionEntity;
import com.education.flashEng.payload.request.StudySessionRequest;
import com.education.flashEng.payload.response.StatisticBySpecificTimeResponse;
import com.education.flashEng.payload.response.StatisticBySpecificWordResponse;
import com.education.flashEng.payload.response.StatisticByTimeResponse;
import com.education.flashEng.payload.response.StatisticByWordResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface StudySessionService {
    boolean createStudySession(StudySessionRequest studySessionRequest);

    Page<StatisticByTimeResponse> getUsersStudyStatisticByTime(Pageable pageable);

    Page<StatisticByWordResponse> getUsersStudyStatisticByWord(Pageable pageable);

    Page<StatisticBySpecificTimeResponse> getUsersStudyStatisticBySpecificTime(LocalDate time, Pageable pageable);

    Page<StatisticBySpecificWordResponse> getUsersStudyStatisticBySpecificWord(Long wordId, Pageable pageable);

    LocalDateTime getReminderTimeBasedOnLevel(StudySessionEntity studySessionEntity, LocalDateTime startTime);
}