package com.education.flashEng.repository;

import com.education.flashEng.entity.ClassSetRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassSetRequestRepository extends JpaRepository<ClassSetRequestEntity, Long> {
    ClassSetRequestEntity findBySetEntityId(Long id);
}
