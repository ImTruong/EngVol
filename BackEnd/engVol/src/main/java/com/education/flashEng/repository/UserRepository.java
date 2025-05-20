package com.education.flashEng.repository;

import com.education.flashEng.entity.UserEntity;
import com.education.flashEng.payload.response.UserDetailResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,Long> {
    Optional<UserEntity> findByUsernameAndStatus(String userName, int status);
    Optional<UserEntity> findByEmailAndStatus(String email, int status);

    Optional<UserEntity> findByIdAndStatus(long id, int status);

    Optional<UserEntity> findByUsername(String username);

    boolean existsByUsernameAndStatus(String username, int status);

    boolean existsByEmailAndStatus(String email, int status);

    @Query("SELECT new com.education.flashEng.payload.response.UserDetailResponse(u.id,u.fullName, u.username, u.email, u.country, r.name, u.status) " +
            "FROM UserEntity u "+
            "JOIN u.roleEntity r " +
            "WHERE (:email IS NULL OR u.email LIKE CONCAT('%', :email, '%')) " +
            "AND (:userName IS NULL OR u.username LIKE CONCAT('%', :userName, '%'))" )
    List<UserDetailResponse> findAllUserDetailResponse(String email, String userName);
}
