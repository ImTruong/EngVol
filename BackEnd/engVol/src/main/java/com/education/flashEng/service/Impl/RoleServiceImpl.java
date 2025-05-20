package com.education.flashEng.service.Impl;

import com.education.flashEng.entity.RoleEntity;
import com.education.flashEng.repository.RoleRepository;
import com.education.flashEng.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;


    @Override
    public Optional<RoleEntity> findRoleById(Long id) {
        return roleRepository.findById(id);
    }

    @Override
    public RoleEntity findRoleByName(String name) {
        return roleRepository.findByName(name);
    }
}
