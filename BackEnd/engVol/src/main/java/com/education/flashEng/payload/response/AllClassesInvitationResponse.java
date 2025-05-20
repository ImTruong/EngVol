package com.education.flashEng.payload.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class AllClassesInvitationResponse {
    private String inviterUsername;
    private String inviteeUsername;
    private String message;
    private Long invitationId;
}
