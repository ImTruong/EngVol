package com.education.flashEng.controller;

import com.education.flashEng.payload.request.StudySessionRequest;
import com.education.flashEng.payload.response.ApiResponse;
import com.education.flashEng.service.StudySessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/study")
public class StudySessionController {

    @Autowired
    private StudySessionService studySessionService;

    @PostMapping
    public ResponseEntity<?> createStudySession(@Valid @RequestBody StudySessionRequest studySessionRequest  ) {
        ApiResponse<String> response = new ApiResponse<>(studySessionService.createStudySession(studySessionRequest),"Study Session Created Successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/time")
    public ResponseEntity<?> getStudyStatisticsByTime(Pageable pageable) {
        ApiResponse<?> response = new ApiResponse<>(true,"Get Statistic Successfully",studySessionService.getUsersStudyStatisticByTime(pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/word")
    public ResponseEntity<?> getStudyStatisticsByWord(Pageable pageable) {
        ApiResponse<?> response = new ApiResponse<>(true,"Get Statistic Successfully",studySessionService.getUsersStudyStatisticByWord(pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/time/{time}")
    public ResponseEntity<?> getStudyStatisticsBySpecificTime(@PathVariable LocalDate time,
                                                              Pageable pageable) {
        ApiResponse<?> response = new ApiResponse<>(true,"Get Statistic Successfully",studySessionService.getUsersStudyStatisticBySpecificTime(time,pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/word/{wordId}")
    public ResponseEntity<?> getStudyStatisticsBySpecificWord(@PathVariable Long wordId,
                                                              Pageable pageable) {
        ApiResponse<?> response = new ApiResponse<>(true,"Get Statistic Successfully",studySessionService.getUsersStudyStatisticBySpecificWord(wordId,pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
