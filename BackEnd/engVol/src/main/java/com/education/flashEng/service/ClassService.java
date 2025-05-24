package com.education.flashEng.service;

import com.education.flashEng.entity.ClassEntity;
import com.education.flashEng.payload.request.CreateClassRequest;
import com.education.flashEng.payload.response.ClassInformationResponse;
import com.education.flashEng.payload.response.ClassMemberListReponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClassService {
    ClassMemberListReponse createClass(CreateClassRequest createClassRequest);

    ClassEntity getClassById(Long id);

    boolean updateClassName(Long classId, String name);

    ClassInformationResponse getClassInformation(Long classId);

    Page<ClassInformationResponse> getAllCurrentUserClasses(Pageable pageable,String name);

    Page<ClassInformationResponse> findClassByName(String name, Pageable pageable);

    boolean deleteClassByEntity(ClassEntity classEntity);

    boolean deleteClassById(Long classId);
}
