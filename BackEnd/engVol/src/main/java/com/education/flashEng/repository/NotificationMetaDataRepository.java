package com.education.flashEng.repository;

import com.education.flashEng.entity.NotificationMetaDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationMetaDataRepository extends JpaRepository<NotificationMetaDataEntity, Long> {
    public Optional<NotificationMetaDataEntity> findByKeyAndValue(String key, String value);
}
