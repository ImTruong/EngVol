package com.education.flashEng.repository;

import com.education.flashEng.entity.RoleClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleClassRepository extends JpaRepository<RoleClassEntity, Long> {
    Optional<RoleClassEntity> findByName(String name);
}
