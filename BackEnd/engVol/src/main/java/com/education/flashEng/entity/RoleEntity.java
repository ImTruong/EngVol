package com.education.flashEng.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "role")
public class RoleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, name = "name")
    private String name;

    @Column(nullable = true, name = "description")
    private String description;

    @OneToMany(mappedBy = "roleEntity")
    private List<UserEntity> users;



}
