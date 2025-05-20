package com.education.flashEng.service.Impl;

import com.education.flashEng.entity.ClassEntity;
import com.education.flashEng.entity.ClassMemberEntity;
import com.education.flashEng.entity.RoleClassEntity;
import com.education.flashEng.entity.UserEntity;
import com.education.flashEng.exception.EntityNotFoundWithIdException;
import com.education.flashEng.exception.UserNotAuthenticatedException;
import com.education.flashEng.payload.request.CreateClassRequest;
import com.education.flashEng.payload.response.ClassInformationResponse;
import com.education.flashEng.payload.response.ClassMemberListReponse;
import com.education.flashEng.repository.ClassRepository;
import com.education.flashEng.service.*;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassServiceImpl implements ClassService {

    @Autowired
    private SetService setService;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private RoleClassService roleClassService;

    @Autowired
    @Lazy
    private ClassMemberService classMemberService;

    @Autowired
    private UserService userService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ClassSetRequestService classSetRequestService;

    @Autowired
    @Lazy
    private ClassInvitationService classInvitationService;

    @Autowired
    @Lazy
    private ClassJoinRequestService classJoinRequestService;

    @Transactional
    @Override
    public ClassMemberListReponse createClass(CreateClassRequest createClassRequest) {
        UserEntity user = userService.getUserFromSecurityContext();

        ClassEntity classEntity = modelMapper.map(createClassRequest, ClassEntity.class);
        classRepository.save(classEntity);

        RoleClassEntity adminRole = roleClassService.getRoleClassByName("ADMIN");

        ClassMemberEntity classMemberEntity = ClassMemberEntity.builder()
                .classEntity(classEntity)
                .userEntity(user)
                .roleClassEntity(adminRole)
                .build();

        classMemberService.saveClassMember(classMemberEntity);
        classEntity.getClassMemberEntityList().add(classMemberEntity);
        return classMemberService.getAllMembers(classEntity.getId(), PageRequest.of(0, 1));
    }

    @Override
    public ClassEntity getClassById(Long id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundWithIdException("Class", id.toString()));
    }

    @Transactional
    @Override
    public boolean updateClassName(Long classId, String name) {
        UserEntity user = userService.getUserFromSecurityContext();
        ClassEntity classEntity = getClassById(classId);
        if (!classMemberService.getClassMemberByClassIdAndUserId(classId, user.getId()).getRoleClassEntity().getName().equals("ADMIN"))
            throw new RuntimeException("You are not authorized to update this class name.");
        classEntity.setName(name);
        classRepository.save(classEntity);
        return true;
    }

    @Override
    public ClassInformationResponse getClassInformation(Long classId) {
        ClassEntity classEntity = getClassById(classId);
        return ClassInformationResponse.builder()
                .classId(classEntity.getId())
                .className(classEntity.getName())
                .numberOfMembers(classEntity.getClassMemberEntityList().size())
                .numberOfSets(classEntity.getSetsEntityList().size())
                .build();
    }

    @Override
    public Page<ClassInformationResponse> getAllCurrentUserClasses(Pageable pageable) {
        UserEntity user = userService.getUserFromSecurityContext();
        List<ClassEntity> classEntityList = user.getClassMemberEntityList().stream()
                .map(ClassMemberEntity::getClassEntity)
                .toList();
        List<ClassInformationResponse> responses = classEntityList.stream()
                .map(classEntity -> ClassInformationResponse.builder()
                        .classId(classEntity.getId())
                        .className(classEntity.getName())
                        .numberOfMembers(classEntity.getClassMemberEntityList().size())
                        .numberOfSets(classEntity.getSetsEntityList().size())
                        .build())
                .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());
        List<ClassInformationResponse> paginatedList = (start > responses.size()) ? List.of() : responses.subList(start, end);
        return new PageImpl<>(paginatedList, pageable, responses.size());
    }

    @Override
    public Page<ClassInformationResponse> findClassByName(String name, Pageable pageable) {
        name = "%" + name + "%";
        List<ClassEntity> classEntityList = classRepository.findAllByNameLike(name);

        List<ClassInformationResponse> result = classEntityList.stream()
                .map(classEntity -> ClassInformationResponse.builder()
                        .classId(classEntity.getId())
                        .className(classEntity.getName())
                        .numberOfMembers(classEntity.getClassMemberEntityList().size())
                        .numberOfSets(classEntity.getSetsEntityList().size())
                        .build())
                .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), result.size());
        List<ClassInformationResponse> paginatedList = (start > result.size()) ? List.of() : result.subList(start, end);
        return new PageImpl<>(paginatedList, pageable, result.size());
    }

    @Transactional
    @Override
    public boolean deleteClassByEntity(ClassEntity classEntity) {

        //delete all related notifications
        classEntity.getClassInvitationEntityList().forEach(classInvitationEntity -> {
            notificationService.deleteAllRelatedNotificationsByNotificationMetaData("classInvitationId", classInvitationEntity.getId().toString());
            classInvitationService.deleteInvitationByEntity(classInvitationEntity);
        });
        classEntity.getClassJoinRequestEntityList().forEach(classJoinRequestEntity -> {
            notificationService.deleteAllRelatedNotificationsByNotificationMetaData("classJoinRequestId", classJoinRequestEntity.getId().toString());
            classJoinRequestService.deleteClassJoinRequestByEntity(classJoinRequestEntity);
        });
        classEntity.getClassSetRequestEntityList().forEach(classSetRequestEntity -> {
            notificationService.deleteAllRelatedNotificationsByNotificationMetaData("classSetRequestId", classSetRequestEntity.getId().toString());
            classSetRequestService.deleteClassSetRequestByEntity(classSetRequestEntity);
        });
        //set all sets privacy status to private
        classEntity.getSetsEntityList().forEach(setEntity -> {
            setService.updateSetPrivacyToPrivateByEntity(setEntity);
        });
        //delete class
        classRepository.delete(classEntity);
        return true;
    }

    @Override
    public boolean deleteClassById(Long classId) {
        UserEntity user = userService.getUserFromSecurityContext();
        ClassEntity classEntity = classRepository.findById(classId).orElseThrow(() -> new EntityNotFoundWithIdException("Class", classId.toString()));
        if (user.getRoleEntity().getName().equals("ADMIN") || classEntity.getClassMemberEntityList().stream().anyMatch(classMemberEntity -> classMemberEntity.getUserEntity().getId().equals(user.getId())&& classMemberEntity.getRoleClassEntity().getName().equals("ADMIN"))) {
            return deleteClassByEntity(classEntity);
        } else
            throw new UserNotAuthenticatedException("You are not authorized to delete this class.");
    }



}
