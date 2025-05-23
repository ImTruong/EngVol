package com.education.flashEng.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter

@Entity
@Table(name = "study_sessions")

public class StudySessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "difficulty", nullable = false)
    private String difficulty;

    @Column(name = "coefficient")
    private Double coefficient = 2.0;

    @Column(name = "reminder_time")
    private Double reminderTime = 1.0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity userEntity;

    @ManyToOne
    @JoinColumn(name = "word_id", nullable = false)
    private WordEntity wordEntity;
}
