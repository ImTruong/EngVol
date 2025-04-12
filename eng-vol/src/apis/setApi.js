// fake data
import setModule from '@/store/modules/setModule';
import classModule from '@/store/modules/classModule';
import store from '@/store';
// end fake data
import axios from "axios"

export const getSetsByName = async (name,token) => {
    // const response = await axios({
    //     method: 'GET',
    //     url: `set?name=${name}`,
    //     headers: { Authorization: `Bearer ${token}`}
    // })
    // if(response.status === 200 || response.isSuccess){
    //     return response.data
    // }else{
    //     throw new Error(response.message)
    // }
    const { fakeDataListSet } = setModule.state();
    const filteredSets = fakeDataListSet.filter(setItem => setItem.name.toLowerCase().includes(name.toLowerCase()));
    return filteredSets;

}

// Tạo hoặc cập nhật set
export const saveSetInfo = async (payload, token, isEditMode) => {
    // try {
    //     const config = {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     };
    //     if (isEditMode) {
    //         const response = await axios.put('/set', payload, config);
    //         return response.data;
    //     } else {
    //         const response = await axios.post('/set', payload, config);
    //         return response.data;
    //     }
    // } catch (error) {
    //     throw error;
    // }
    const result = store.dispatch('setModule/addOrUpdateSet', { payload, isEditMode });
    return result;
};

// Xóa bộ từ vựng
export const deleteSet = async (setId, token) => {
    // try {
    //     const config = {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     };
    //     const response = await axios.delete(`/set/${setId}`, config);
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    store.commit('deleteSet', setId);
};

export const getSetByClassId = async (classId, token) => {
    // try {
    //     const response = await axios.get(`/set/class/${classId}`, {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    const { fakeDataListSet } = setModule.state();
    const sets = fakeDataListSet.filter(setItem => setItem.classId == classId);
    return sets;
};

// Lấy thông tin bộ từ vựng theo requestId
export const getSetByRequestId = async (requestId, token) => {
    // try {
    //     const response = await axios.get(`/set-request/${requestId}`, {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error fetching set by ID:', error);
    //     throw error;
    // }
    const { fakeDataListSet } = setModule.state();
    const { fakeDataClassList } = classModule.state();
    const setId = fakeDataClassList.find(classItem => classItem.setRequestList.find(request => request.requestId === requestId)).setId;
    const set = fakeDataListSet.find(setItem => setItem.id === setId);
    return set;
};

// Chấp nhận yêu cầu bộ từ vựng
export const acceptSetRequest = async (requestId, token) => {
    // try {
    //     const response = await axios.put(`/set-request/accept/${requestId}`, {}, {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error accepting set request:', error);
    //     throw error;
    // }
};

// Từ chối yêu cầu bộ từ vựng
export const rejectSetRequest = async (requestId, token) => {
    try {
        const response = await axios.put(`/set-request/reject/${requestId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error rejecting set request:', error);
        throw error;
    }
};

export const getAllPublicSet = async (token) => {
    // try {
    //     const response = await axios.get('/set/public', {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error fetching public sets:', error);
    //     throw error;
    // }
    const { fakeDataListSet } = setModule.state();
    const publicSets = fakeDataListSet.filter(setItem => setItem.privacyStatus == 'public');
    return publicSets;
}

export const getAllPrivateSet = async (token) => {
    // try {
    //     const response = await axios.get('/set/private', {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error fetching public sets:', error);
    //     throw error;
    // }
    const { fakeDataListSet } = setModule.state();
    const privateSets = fakeDataListSet.filter(setItem => setItem.privacyStatus == 'private');
    return privateSets;
}

export const getRecentSet = async (token) => {
    // try {
    //     const response = await axios.get('/set/recent', {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error fetching recent sets:', error);
    //     throw error;
    // }
    const { fakeDataListSet } = setModule.state();
    const recentSets = fakeDataListSet.slice(0, 5);
    return recentSets;
}
