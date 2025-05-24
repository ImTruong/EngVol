package com.education.flashEng.service.Impl;

import com.education.flashEng.entity.StudySessionEntity;
import com.education.flashEng.entity.UserEntity;
import com.education.flashEng.entity.WordEntity;
import com.education.flashEng.exception.EntityNotFoundWithIdException;
import com.education.flashEng.payload.request.StudySessionRequest;
import com.education.flashEng.payload.response.StatisticBySpecificTimeResponse;
import com.education.flashEng.payload.response.StatisticBySpecificWordResponse;
import com.education.flashEng.payload.response.StatisticByTimeResponse;
import com.education.flashEng.payload.response.StatisticByWordResponse;
import com.education.flashEng.repository.StudySessionRepository;
import com.education.flashEng.repository.WordRepository;
import com.education.flashEng.service.StudySessionService;
import com.education.flashEng.util.TimeUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class StudySessionServiceImpl implements StudySessionService {
    @Autowired
    private  UserServiceImpl userServiceImpl;
    @Autowired
    private  WordRepository wordRepository;
    @Autowired
    private  StudySessionRepository studySessionRepository;
    @Autowired
    private  NotificationServiceImpl notificationServiceImpl;
    @Autowired
    private TimeUtil timeUtil;

    @Transactional
    @Override
    public boolean createStudySession(StudySessionRequest studySessionRequest) {
        UserEntity currentUser = userServiceImpl.getUserFromSecurityContext();
        StudySessionEntity studySessionEntity = new StudySessionEntity();
        WordEntity wordEntity = wordRepository.findById(studySessionRequest.getWordId())
                .orElseThrow(() -> new EntityNotFoundWithIdException("Word", studySessionRequest.getWordId().toString()));
        String privacy = wordEntity.getSetEntity().getPrivacyStatus();
        if(!privacy.equals("PUBLIC")
                && !(privacy.equals("PRIVATE") && wordEntity.getSetEntity().getUserEntity().getId().equals(currentUser.getId()))
                && !(privacy.equals("CLASS") && wordEntity.getSetEntity().getClassEntity().getClassMemberEntityList().stream().anyMatch(classMemberEntity -> classMemberEntity.getUserEntity().getId().equals(currentUser.getId()))))
            throw new AccessDeniedException("You do not have permission to study this word");

        studySessionEntity.setUserEntity(currentUser);
        studySessionEntity.setWordEntity(wordEntity);
        studySessionEntity.setDifficulty(studySessionRequest.getDifficulty());
        StudySessionEntity studySession = studySessionRepository.save(studySessionEntity);
        notificationServiceImpl.createStudySessionNotification(studySessionEntity,getReminderTimeBasedOnLevel(studySession, LocalDateTime.now()));
        studySessionRepository.save(studySessionEntity);
        return true;
    }

    @Override
    public Page<StatisticByTimeResponse> getUsersStudyStatisticByTime(Pageable pageable) {
        Long userId = userServiceImpl.getUserFromSecurityContext().getId();
        List<StatisticByTimeResponse> statistics = studySessionRepository.findUsersStudyStaticByTime(userId);

        // Apply paging
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), statistics.size());
        List<StatisticByTimeResponse> paginatedList = (start > statistics.size()) ? Collections.emptyList() : statistics.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, statistics.size());
    }

    @Override
    public Page<StatisticByWordResponse> getUsersStudyStatisticByWord(Pageable pageable) {
        Long userId = userServiceImpl.getUserFromSecurityContext().getId();
        List<StatisticByWordResponse> statistics = studySessionRepository.findUsersStudyStaticByWord(userId);

        // Apply paging
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), statistics.size());
        List<StatisticByWordResponse> paginatedList = (start > statistics.size()) ? Collections.emptyList() : statistics.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, statistics.size());
    }

    @Override
    public Page<StatisticBySpecificTimeResponse> getUsersStudyStatisticBySpecificTime(LocalDate time, Pageable pageable) {
        Long userId = userServiceImpl.getUserFromSecurityContext().getId();
        List<StatisticBySpecificTimeResponse> statistics = studySessionRepository.findUsersStudyStaticBySpecificTime(userId, time);

        // Apply paging
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), statistics.size());
        List<StatisticBySpecificTimeResponse> paginatedList = (start > statistics.size()) ? Collections.emptyList() : statistics.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, statistics.size());
    }

    @Override
    public Page<StatisticBySpecificWordResponse> getUsersStudyStatisticBySpecificWord(Long wordId, Pageable pageable) {
        Long userId = userServiceImpl.getUserFromSecurityContext().getId();
        List<StatisticBySpecificWordResponse> statistics = studySessionRepository.findUsersStudyStaticBySpecificWord(userId, wordId);

        // Apply paging
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), statistics.size());
        List<StatisticBySpecificWordResponse> paginatedList = (start > statistics.size()) ? Collections.emptyList() : statistics.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, statistics.size());
    }

    @Override
    public LocalDateTime getReminderTimeBasedOnLevel(StudySessionEntity studySessionEntity, LocalDateTime startTime) {
        Optional<StudySessionEntity> studySessionEntityOptional = studySessionRepository.findSecondNewestStudySessionEntityByWordEntityIdAndUserEntityId(studySessionEntity.getWordEntity().getId(), studySessionEntity.getUserEntity().getId());
        double reminderTime = studySessionEntity.getReminderTime();
        double coefficient = studySessionEntity.getCoefficient();
        if(studySessionEntityOptional.isPresent()){
            StudySessionEntity newestStudySession = studySessionEntityOptional.get();
            reminderTime = newestStudySession.getReminderTime();
            coefficient = newestStudySession.getCoefficient();
        }
        switch (studySessionEntity.getDifficulty().toLowerCase()){
            case "very easy":
                // Tăng mạnh hệ số - từ dễ nhớ lâu hơn
                coefficient = coefficient * 1.3;
                if(coefficient > 4.0) coefficient = 4.0; // Giới hạn tối đa
                break;

            case "easy":
                // Tăng vừa phải
                coefficient = coefficient * 1.15;
                if(coefficient > 3.5) coefficient = 3.5;
                break;

            case "difficult":
                // Giảm nhưng không quá mạnh
                coefficient = coefficient * 0.75;
                if(coefficient < 1.2) coefficient = 1.2; // Giới hạn tối thiểu
                break;

            case "very difficult":
                // Giảm mạnh nhưng không reset hoàn toàn như cũ
                coefficient = coefficient * 0.6;
                if(coefficient < 1.0) coefficient = 1.0;
                reminderTime = reminderTime * 0.7;
                if(reminderTime < 0.5) reminderTime = 0.5; // Tối thiểu 12 tiếng
                break;
        }
        // Tính thời gian ôn lại tiếp theo
        double nextReminderTime = reminderTime * coefficient;

        // Áp dụng giới hạn an toàn
        if(nextReminderTime < 0.5) nextReminderTime = 0.5;   // Tối thiểu 12 tiếng
        if(nextReminderTime > 180.0) nextReminderTime = 180.0; // Tối đa 6 tháng

        LocalDateTime newRemindTime = timeUtil.addFractionOfDay(startTime, nextReminderTime);

        // Cập nhật thông số
        studySessionEntity.setCoefficient(coefficient);
        studySessionEntity.setReminderTime(nextReminderTime);

        return newRemindTime;
    }
}
