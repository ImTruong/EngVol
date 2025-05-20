package com.education.flashEng.repository;

import com.education.flashEng.entity.StudySessionEntity;
import com.education.flashEng.payload.response.StatisticBySpecificTimeResponse;
import com.education.flashEng.payload.response.StatisticBySpecificWordResponse;
import com.education.flashEng.payload.response.StatisticByTimeResponse;
import com.education.flashEng.payload.response.StatisticByWordResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySessionEntity, Long> {
    @Query("SELECT new com.education.flashEng.payload.response.StatisticByTimeResponse(FUNCTION('DATE', s.createdAt), COUNT(s)) " +
            "FROM StudySessionEntity s WHERE s.userEntity.id = :userId " +
            "GROUP BY FUNCTION('DATE', s.createdAt) ORDER BY FUNCTION('DATE', s.createdAt) DESC")
    List<StatisticByTimeResponse> findUsersStudyStaticByTime(@Param("userId") Long userId);

    @Query("SELECT new com.education.flashEng.payload.response.StatisticByWordResponse(s.wordEntity.id, COUNT(s), s.wordEntity.word) " +
            "FROM StudySessionEntity s WHERE s.userEntity.id = :userId " +
            "GROUP BY s.wordEntity.id ORDER BY COUNT(s) DESC")
    List<StatisticByWordResponse> findUsersStudyStaticByWord(@Param("userId") Long userId);

    @Query("SELECT new com.education.flashEng.payload.response.StatisticBySpecificTimeResponse(" +
            "s.createdAt, s.wordEntity.id, s.wordEntity.word, s.difficulty) " +
            "FROM StudySessionEntity s " +
            "WHERE s.userEntity.id = :userId AND FUNCTION('DATE', s.createdAt) = :time " +
            "ORDER BY s.createdAt DESC")
    List<StatisticBySpecificTimeResponse> findUsersStudyStaticBySpecificTime(@Param("userId") Long userId, @Param("time") LocalDate time);

    @Query("SELECT new com.education.flashEng.payload.response.StatisticBySpecificWordResponse(s.wordEntity.id, s.wordEntity.word, s.difficulty, FUNCTION('DATE', s.createdAt) ) " +
            "FROM StudySessionEntity s " +
            "WHERE s.userEntity.id = :userId AND s.wordEntity.id = :wordId " +
            "ORDER BY s.createdAt DESC")
    List<StatisticBySpecificWordResponse> findUsersStudyStaticBySpecificWord(@Param("userId") Long userId, @Param("wordId") Long wordId);

    @Query(value = "SELECT * FROM study_sessions s WHERE s.word_id = :wordId AND s.user_id = :userId ORDER BY s.created_at DESC LIMIT 1 OFFSET 1", nativeQuery = true)
    Optional<StudySessionEntity> findSecondNewestStudySessionEntityByWordEntityIdAndUserEntityId(@Param("wordId") Long wordId, @Param("userId") Long userId);
}
