package com.education.flashEng.repository;

import com.education.flashEng.entity.SetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SetRepository extends JpaRepository<SetEntity, Long> {
    List<SetEntity> findAllByPrivacyStatus(String privacyStatus);
    List<SetEntity> findAllByPrivacyStatusAndUserEntityId(String privacyStatus, Long userId);
    List<SetEntity> findAllByPrivacyStatusAndClassEntityId(String privacyStatus, Long classId);

    @Query("SELECT s FROM SetEntity s WHERE (:name IS NULL OR :name = '' OR s.name LIKE %:name%)")
    List<SetEntity> findAllByNameContaining(String name);

    @Query("SELECT s FROM SetEntity s WHERE (:name IS NULL OR :name = '' OR s.name LIKE %:name%) AND s.classEntity.id = :classId")
    List<SetEntity> findAllByClassEntityIdAndNameContaining(Long classId, String name);

    List<SetEntity> findAllByPrivacyStatusAndNameLike(String aPublic, String name);
}
