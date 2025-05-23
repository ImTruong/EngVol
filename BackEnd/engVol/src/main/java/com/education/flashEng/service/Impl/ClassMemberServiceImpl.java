package com.education.flashEng.service.Impl;

import com.education.flashEng.entity.ClassEntity;
import com.education.flashEng.entity.ClassMemberEntity;
import com.education.flashEng.entity.UserEntity;
import com.education.flashEng.exception.EntityNotFoundWithIdException;
import com.education.flashEng.exception.LastAdminException;
import com.education.flashEng.payload.response.ClassMemberListReponse;
import com.education.flashEng.repository.ClassMemberRepository;
import com.education.flashEng.service.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class ClassMemberServiceImpl implements ClassMemberService {

    @Autowired
    private ClassMemberRepository classMemberRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleClassService roleClassService;

    @Autowired
    private ClassService classService;

    @Autowired
    private NotificationService notificationService;


    @Override
    public ClassMemberEntity saveClassMember(ClassMemberEntity classMemberEntity) {
        return classMemberRepository.save(classMemberEntity);
    }

    @Override
    public ClassMemberEntity getClassMemberByClassIdAndUserId(Long classId, Long userId) {
        return classMemberRepository.findByClassEntityIdAndUserEntityId(classId, userId)
                .orElseThrow(() ->
                        new EntityNotFoundWithIdException("Class And User", classId + " And " + userId));
    }

    @Transactional
    @Override
    public boolean deleteClassMember(Long userId,Long classId) {
        UserEntity user = userService.getUserFromSecurityContext();
        ClassMemberEntity classMemberEntity = classMemberRepository.findByClassEntityIdAndUserEntityId(classId, userId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this class."));
        ClassMemberEntity classCurrentMemberEntity = classMemberRepository.findByClassEntityIdAndUserEntityId(classId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this class."));
        if (!classCurrentMemberEntity.getRoleClassEntity().getName().equals("ADMIN") && !user.getRoleEntity().getName().equals("ADMIN"))
            throw new AccessDeniedException("You are not authorized to delete members from this class.");
        if (classMemberEntity.getUserEntity().getId().equals(user.getId()))
            leaveClass(classId);
        else{
            notificationService.deleteUserNotificationOfAClassWhenUserRoleChanged(classMemberEntity.getClassEntity(),classMemberEntity.getUserEntity());
            classMemberRepository.delete(classMemberEntity);
        }
        return false;
    }

    @Transactional
    @Override
    public boolean changeRole(Long userId, Long classId, String role) {
        UserEntity user = userService.getUserFromSecurityContext();
        ClassMemberEntity classMemberEntity = classMemberRepository.findByClassEntityIdAndUserEntityId(classId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this class."));
        if (!classMemberEntity.getRoleClassEntity().getName().equals("ADMIN") && !user.getRoleEntity().getName().equals("ADMIN"))
            throw new AccessDeniedException("You are not authorized to change roles in this class.");
        ClassMemberEntity memberEntity = classMemberRepository.findByClassEntityIdAndUserEntityId(classId, userId)
                .orElseThrow(() -> new EntityNotFoundWithIdException("Class Member", userId.toString()));
        if (memberEntity.getClassEntity().getClassMemberEntityList().stream()
                .filter(member -> member.getRoleClassEntity().getName().equals("ADMIN"))
                .count() == 1 && user.getId() == userId && classMemberEntity.getRoleClassEntity().getName().equals("ADMIN")) {
            throw new LastAdminException("You are the last admin in this class. You can`t change your role.");
        }
        memberEntity.setRoleClassEntity(roleClassService.getRoleClassByName(role.toUpperCase()));
        if (!memberEntity.getRoleClassEntity().getName().equals("ADMIN"))
            notificationService.deleteUserNotificationOfAClassWhenUserRoleChanged(classMemberEntity.getClassEntity(),classMemberEntity.getUserEntity());
        classMemberRepository.save(memberEntity);
        return true;
    }

    @Override
    public ClassMemberListReponse getAllMembers(Long classId, Pageable pageable) {
        UserEntity user = userService.getUserFromSecurityContext();
        if (classMemberRepository.findByClassEntityIdAndUserEntityId(classId, user.getId()).isEmpty() && !user.getRoleEntity().getName().equals("ADMIN"))
            throw new AccessDeniedException("You are not a member of this class.");
        ClassEntity classEntity = classService.getClassById(classId);
        ClassMemberListReponse classMemberListReponse = ClassMemberListReponse.builder()
                .classId(classEntity.getId())
                .className(classEntity.getName())
                .memberList(classEntity.getClassMemberEntityList().stream()
                        .map(classMemberEntity -> ClassMemberListReponse.MemberInfo.builder()
                                .userId(classMemberEntity.getUserEntity().getId())
                                .userName(classMemberEntity.getUserEntity().getUsername())
                                .role(classMemberEntity.getRoleClassEntity().getName())
                                .build())
                        .toList())
                .build();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), classMemberListReponse.getMemberList().size());

        long totalElements = classMemberListReponse.getMemberList().size();
        int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());

        classMemberListReponse.setCurrentPage(pageable.getPageNumber());
        classMemberListReponse.setPageSize(pageable.getPageSize());
        classMemberListReponse.setTotalPages(totalPages);
        classMemberListReponse.setTotalElements(totalElements);

        if (start >= totalElements) {
            classMemberListReponse.setMemberList(Collections.emptyList());
        } else {
            classMemberListReponse.setMemberList(classMemberListReponse.getMemberList().subList(start, end));
        }

        return classMemberListReponse;
    }

    @Transactional
    @Override
    public boolean leaveClass(Long classId) {
        UserEntity user = userService.getUserFromSecurityContext();
        ClassMemberEntity classMemberEntity = classMemberRepository.findByClassEntityIdAndUserEntityId(classId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this class."));
        ClassEntity classEntity = classMemberEntity.getClassEntity();
        if(classEntity.getClassMemberEntityList().stream()
                .filter(member -> member.getRoleClassEntity().getName().equals("ADMIN"))
                .count() >= 2|| classMemberEntity.getClassEntity().getClassMemberEntityList().size() == 1  || classEntity.getClassMemberEntityList().stream().filter(member -> member.getUserEntity() == user).anyMatch(member -> member.getRoleClassEntity().getName().equals("MEMBER"))){
            classMemberRepository.delete(classMemberEntity);
            classEntity.getClassMemberEntityList().remove(classMemberEntity);
            user.getSetsEntityList().stream().filter(setEntity -> setEntity.getClassEntity()!=null).filter(setsEntity -> setsEntity.getClassEntity().getId().equals(classId))
                    .forEach(setsEntity -> setsEntity.setPrivacyStatus("Private"));
            notificationService.deleteUserNotificationOfAClassWhenUserRoleChanged(classMemberEntity.getClassEntity(),classMemberEntity.getUserEntity());
        }
        else
            throw new LastAdminException("You are the last admin in this class. You can`t leave this class.");
        if(classEntity.getClassMemberEntityList().isEmpty())
            classService.deleteClassByEntity(classEntity);
        return true;
    }

    @Override
    public boolean checkUserInClass(Long classId) {
        UserEntity user = userService.getUserFromSecurityContext();
        ClassMemberEntity classMemberEntity = classMemberRepository.findByClassEntityIdAndUserEntityId(classId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this class."));
        return true;
    }

    @Override
    public ClassMemberListReponse searchMembers(Long classId, String name, Pageable pageable) {
        UserEntity user = userService.getUserFromSecurityContext();
        if (classMemberRepository.findByClassEntityIdAndUserEntityId(classId, user.getId()).isEmpty() && !user.getRoleEntity().getName().equals("ADMIN"))
            throw new AccessDeniedException("You are not a member of this class.");
        ClassEntity classEntity = classService.getClassById(classId);
        ClassMemberListReponse classMemberListReponse = ClassMemberListReponse.builder()
                .classId(classEntity.getId())
                .className(classEntity.getName())
                .memberList(classEntity.getClassMemberEntityList().stream()
                        .filter(classMemberEntity -> classMemberEntity.getUserEntity().getUsername().toLowerCase().contains(name.toLowerCase()))
                        .map(classMemberEntity -> ClassMemberListReponse.MemberInfo.builder()
                                .userId(classMemberEntity.getUserEntity().getId())
                                .userName(classMemberEntity.getUserEntity().getUsername())
                                .role(classMemberEntity.getRoleClassEntity().getName())
                                .build())
                        .toList())
                .build();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), classMemberListReponse.getMemberList().size());

        long totalElements = classMemberListReponse.getMemberList().size();
        int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());

        classMemberListReponse.setCurrentPage(pageable.getPageNumber());
        classMemberListReponse.setPageSize(pageable.getPageSize());
        classMemberListReponse.setTotalPages(totalPages);
        classMemberListReponse.setTotalElements(totalElements);

        if (start >= totalElements) {
            classMemberListReponse.setMemberList(Collections.emptyList());
        } else {
            classMemberListReponse.setMemberList(classMemberListReponse.getMemberList().subList(start, end));
        }

        return classMemberListReponse;
    }
}
