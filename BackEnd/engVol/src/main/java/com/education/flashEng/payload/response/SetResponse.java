package com.education.flashEng.payload.response;

import com.education.flashEng.entity.UserEntity;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SetResponse {
    private Long id;
    private String name;
    private String description;
    private String privacyStatus;
    private Long numberOfWords;
    private List<WordResponse> wordResponses;
    private UserDetailResponse userDetailResponse;

    public void setUserDetailResponse(String fullName, String username, String email, String country) {
        userDetailResponse = new UserDetailResponse(fullName, username, email, country);
    }
}
