package com.education.flashEng.service;

import com.education.flashEng.entity.*;
import com.education.flashEng.payload.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface NotificationService {
    boolean createClassJoinRequestNotification(ClassJoinRequestEntity classJoinRequestEntity);

    boolean createClassInvitationNotification(ClassInvitationEntity classInvitationEntity);

    NotificationMetaDataEntity getNotificationMetaDataEntityByKeyAndValue(String key, String value);

    boolean deleteAllRelatedNotificationsByNotificationMetaData(String key, String value);

    boolean createAcceptedClassJoinRequestNotification(ClassJoinRequestEntity classJoinRequestEntity);

    boolean createRejectedClassJoinRequestNotification(ClassJoinRequestEntity classJoinRequestEntity);

    boolean createAcceptedClassInvitationNotification(ClassInvitationEntity classInvitationEntity);

    boolean createRejectedClassInvitationNotification(ClassInvitationEntity classInvitationEntity);

    boolean createClassSetRequestNotification(ClassSetRequestEntity classSetRequestEntity);

    boolean createAcceptRequestNotification(SetEntity setEntity);

    boolean createRejectRequestNotification(SetEntity setEntity, ClassEntity classEntity);

    boolean createStudySessionNotification(StudySessionEntity studySessionEntity, LocalDateTime localDateTime);

    Page<NotificationResponse> getAllCurrentUserNotifications(Pageable pageable);

    boolean deleteUserNotificationOfAClassWhenUserRoleChanged(ClassEntity classEntity, UserEntity userEntity);

    boolean readNotification(Long notificationId);
}
