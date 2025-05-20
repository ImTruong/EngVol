package com.education.flashEng.service;

import com.education.flashEng.entity.RoleEntity;

import java.util.Optional;

public interface RoleService {

    Optional<RoleEntity> findRoleById(Long id);

    RoleEntity findRoleByName(String name);

}
