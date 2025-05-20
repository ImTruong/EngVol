package com.education.flashEng.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class ClassInvitationResponse {

    private ClassInformationResponse classInformationResponse;

    private String inviterUsername;

    private Long invitationId;

}
