package com.education.flashEng.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Setter
@Getter
public class CreateWordRequest {
    @NotNull(message = "Set Id is required")
    private Long setId;

    @NotBlank(message = "Word name is required")
    private String word;

    private String ipa;

    @NotBlank(message = "Definition is required")
    private String definition;

    private String example;

    private MultipartFile image;

    private String audio;
}
