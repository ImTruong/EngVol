package com.education.flashEng.service;

import com.education.flashEng.payload.request.CreateWordRequest;
import com.education.flashEng.payload.request.UpdateWordRequest;
import com.education.flashEng.payload.response.WordResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WordService {
    WordResponse createWord(CreateWordRequest createWordRequest);
    List<WordResponse> getWordBySetId(Long setId);
    boolean updateWord(UpdateWordRequest updateWordRequest);
    boolean deleteWordById(Long wordId);

    Page<WordResponse> getCurrentUserWord(Pageable pageable);
}
