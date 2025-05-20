package com.education.flashEng.service;

import com.education.flashEng.entity.SetEntity;
import com.education.flashEng.payload.request.CreateSetRequest;
import com.education.flashEng.payload.request.UpdateSetRequest;
import com.education.flashEng.payload.response.SetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SetService {
    SetResponse createSet(CreateSetRequest createSetRequest);
    Page<SetResponse> getOwnPublicAndPrivateSet(Pageable pageable);
    List<SetResponse> getPrivateSet();
    Page<SetResponse> getSetByClassID(Long classID, Pageable pageable);
    boolean updateSet(UpdateSetRequest updateSetRequest);
    boolean deleteSetById(Long setID);
    Page<SetResponse> getRecentSet(Pageable pageable);
    Page<SetResponse> findSetByName(Long classId, String name, Pageable pageable);

    Page<SetResponse> getPublicSet(Pageable pageable, String name);
    boolean updateSetPrivacyToPrivateByEntity(SetEntity setEntity);
}