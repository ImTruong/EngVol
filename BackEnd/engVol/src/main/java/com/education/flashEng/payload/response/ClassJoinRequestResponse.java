package com.education.flashEng.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class ClassJoinRequestResponse {

    private ClassInformationResponse classInformationResponse;

    private String requesterName;

    private Long requestId;
}
