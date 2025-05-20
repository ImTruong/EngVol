package com.education.flashEng.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class ClassMemberListReponse {

    private Long classId;
    private String className;
    private List<MemberInfo> memberList;

    private int currentPage;
    private int pageSize;
    private int totalPages;
    private long totalElements;

    @Data
    @Builder
    public static class MemberInfo {
        private Long userId;
        private String userName;
        private String role;
    }
}