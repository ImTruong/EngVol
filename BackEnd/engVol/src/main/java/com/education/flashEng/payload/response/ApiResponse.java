package com.education.flashEng.payload.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean isSuccess = true;
    private String message;
    private T data;

    public ApiResponse(boolean b, String s) {
        this.isSuccess = b;
        this.message = s;
    }
}
