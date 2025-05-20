package com.education.flashEng.payload.response;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class UserDetailResponse {

    private Long id;

    private String fullName;

    private String username;

    private String email;

    private String country;

    private String role;

    private int status;

    public UserDetailResponse(String fullName, String username, String email, String country) {
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.country = country;
    }

    public UserDetailResponse(Long id,String fullName, String username, String email, String country, String role, int status) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.country = country;
        this.role = role;
        this.status = status;
    }
}
