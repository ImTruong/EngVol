package com.education.flashEng.controller.admin;

import com.education.flashEng.payload.response.ApiResponse;
import com.education.flashEng.service.UserService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/admin/user")

public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam (required = false) String userName,
                                         @RequestParam (required = false) String email,
                                         Pageable pageable) {
        ApiResponse apiResponse = new ApiResponse(true, "Get All Users Successfully", userService.getAllUserDetailResponse(pageable, email, userName));
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteUser(@RequestParam @NotNull(message = "User id is required") Long userId) {
        ApiResponse apiResponse = new ApiResponse(userService.deleteUser(userId), "Delete User Successfully");
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @PutMapping("/role")
    public ResponseEntity<?> updateUserRole(@RequestParam @NotNull(message = "User id is required") Long userId,
                                            @RequestParam @NotNull(message = "Role is required") Long roleId) {
        ApiResponse apiResponse = new ApiResponse(true, "Update User Role Successfully", userService.updateUserRole(userId, roleId));
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @PutMapping("/password")
    public ResponseEntity<?> updateUserPassword(@RequestParam @NotNull(message = "User id is required") Long userId,
                                                @RequestParam @NotNull(message = "Password is required") String password) {
        ApiResponse apiResponse = new ApiResponse(true, "Update User Password Successfully", userService.AdminUpdateUserPassword(userId, password));
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @PutMapping("/reActivate")
    public ResponseEntity<?> reActivateUser(@RequestParam @NotNull(message = "User id is required") Long userId) {
        ApiResponse apiResponse = new ApiResponse(true, "Re-Activate User Successfully", userService.reActivateUser(userId));
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }


}
