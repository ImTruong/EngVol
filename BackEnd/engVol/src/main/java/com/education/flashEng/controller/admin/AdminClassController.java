package com.education.flashEng.controller.admin;

import com.education.flashEng.payload.response.ApiResponse;
import com.education.flashEng.service.ClassService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/admin/class")
public class AdminClassController {

    @Autowired
    private ClassService classService;

    @GetMapping
    public ResponseEntity<?> getAllClasses(@RequestParam(required = false) String name,
                                           Pageable pageable) {
        ApiResponse apiResponse = new ApiResponse(true, "Get All Classes Successfully", classService.findClassByName(name,pageable));
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }



}
