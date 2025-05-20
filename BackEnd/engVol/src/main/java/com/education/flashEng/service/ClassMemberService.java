package com.education.flashEng.service;

import com.education.flashEng.entity.ClassMemberEntity;
import com.education.flashEng.payload.response.ClassMemberListReponse;
import org.springframework.data.domain.Pageable;

public interface ClassMemberService {
    ClassMemberEntity saveClassMember(ClassMemberEntity classMemberEntity);

    ClassMemberEntity getClassMemberByClassIdAndUserId(Long classId, Long userId);

    boolean deleteClassMember(Long userId,Long classId);

    boolean changeRole(Long userId, Long classId, String role);

    ClassMemberListReponse getAllMembers(Long classId, Pageable pageable);

    boolean leaveClass(Long classId);

    boolean checkUserInClass(Long classId);

    ClassMemberListReponse searchMembers(Long classId, String name, Pageable pageable);
}
