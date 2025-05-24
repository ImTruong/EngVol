package com.education.flashEng.controller;

import com.education.flashEng.payload.request.ClassNameChangeRequest;
import com.education.flashEng.payload.request.CreateClassRequest;
import com.education.flashEng.payload.response.ApiResponse;
import com.education.flashEng.payload.response.ClassMemberListReponse;
import com.education.flashEng.service.ClassService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/class")
public class ClassController {

    @Autowired
    private ClassService classService;

    @GetMapping("/public/{classId}")
    public ResponseEntity<?> getClassInformation(@PathVariable Long classId) {
        ApiResponse<?> response = new ApiResponse<>(true, "Class Information Fetched Successfully", classService.getClassInformation(classId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> findClassByName(@RequestParam @NotNull(message = "Class name is required") String name,
                                             Pageable pageable) {
        ApiResponse<?> response = new ApiResponse<>(true, "Classes Fetched Successfully", classService.findClassByName(name, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getAllCurrentUserClasses(@RequestParam (required = false) String name,
                                                    Pageable pageable) {
        ApiResponse<?> response = new ApiResponse<>(true, "Classes Fetched Successfully", classService.getAllCurrentUserClasses(pageable,name));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createClass(@Valid @RequestBody CreateClassRequest createClassRequest) {
        ApiResponse<ClassMemberListReponse> response = new ApiResponse<>(true,"Class Created Successfully", classService.createClass(createClassRequest));
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/update/name")
    public ResponseEntity<?> updateClassName(@Valid @RequestBody ClassNameChangeRequest classNameChangeRequest) {
        ApiResponse<String> response = new ApiResponse<>(classService.updateClassName(classNameChangeRequest.getClassId(), classNameChangeRequest.getName()), "Class Name Updated Successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteClass(@RequestParam @NotNull(message = "classID is required") Long classId){
        ApiResponse apiResponse = new ApiResponse(true, "Delete Class Successfully", classService.deleteClassById(classId));
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }
}