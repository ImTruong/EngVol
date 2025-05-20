package com.education.flashEng.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class WordResponse {
    private Long id;
    private String word;
    private String ipa;
    private String definition;
    private String example;
    private String image;
    private String audio;
}
