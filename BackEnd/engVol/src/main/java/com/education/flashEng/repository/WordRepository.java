package com.education.flashEng.repository;

import com.education.flashEng.entity.WordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<WordEntity, Long> {
    List<WordEntity> findAllBySetEntityId(Long id);
}
