package com.education.flashEng.service;

import com.education.flashEng.entity.UserEntity;
import com.education.flashEng.payload.request.RegisterRequest;
import com.education.flashEng.payload.request.UpdateUserPasswordRequest;
import com.education.flashEng.payload.request.UpdateUserRequest;
import com.education.flashEng.payload.response.UserDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    boolean register(RegisterRequest registerRequest);
    UserEntity getUserFromSecurityContext();
    UserEntity getUserById(Long id);

    UserEntity getUserByUsername(String username);
    boolean update(UpdateUserRequest updateRequest);
    boolean updatePassword(UpdateUserPasswordRequest updateUserPasswordRequest);
    UserDetailResponse getUserDetailResponse();
    Page<UserDetailResponse> getAllUserDetailResponse(Pageable pageable, String email, String userName);
    boolean deleteUser(Long id);
    boolean updateUserRole(Long userId, Long roleId);
    boolean AdminUpdateUserPassword(Long userId, String password);
    boolean reActivateUser(Long id);
    String getCurrentUserRole();
}
