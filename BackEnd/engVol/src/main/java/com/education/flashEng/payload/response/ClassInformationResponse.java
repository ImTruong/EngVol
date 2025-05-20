package com.education.flashEng.payload.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class ClassInformationResponse {
    private Long classId;

    private String className;

    private Integer numberOfMembers;

    private Integer numberOfSets;
}
