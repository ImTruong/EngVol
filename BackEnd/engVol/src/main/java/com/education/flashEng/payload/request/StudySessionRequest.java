package com.education.flashEng.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudySessionRequest {

    @NotBlank(message = "difficulty is required")
    private String difficulty;

    @NotNull(message = "wordId is required")
    private Long wordId;
}
