// fake data
import setModule from '@/store/modules/setModule';
import classModule from '@/store/modules/classModule';
import store from '@/store';
// end fake data
import axios from "axios"

export const getSetsByName = async (name,token,page,size,classId=null) => {
    try{
        const response = await axios({
            method: 'GET',
            url: `/set/search`,
            headers: { Authorization: `Bearer ${token}`},
            params: {
                page: page,
                size: size,
                classId: classId,
                name: name
            }
        })
        return response.data.data
    }catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataListSet } = setModule.state();
    // const filteredSets = fakeDataListSet.filter(setItem => setItem.name.toLowerCase().includes(name.toLowerCase()));
    // return filteredSets;
}

// Tạo hoặc cập nhật set
export const saveSetInfo = async (payload, token, isEditMode) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        let response = null;
        if (isEditMode) {
            response = await axios.put('/set', payload, config);
        } else {
            response = await axios.post('/set', payload, config);
        }
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const result = store.dispatch('setModule/addOrUpdateSet', { payload, isEditMode });
    // return result;
};

// Xóa bộ từ vựng
export const deleteSet = async (setId, token) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await axios.delete(`/set/${setId}`, config);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // store.commit('deleteSet', setId);
};

export const getSetByClassId = async (classId, token,page,size) => {
    try {
        const response = await axios.get(`/set/class/${classId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params:{
                page:page,
                size:size
            }
        });
        return response.data.data;
    }catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataListSet } = setModule.state();
    // const sets = fakeDataListSet.filter(setItem => setItem.classId == classId);
    // return sets;
};

// Lấy thông tin bộ từ vựng theo requestId
export const getSetByRequestId = async (requestId, token) => {
    try {
        const response = await axios.get(`/set-request/${requestId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataListSet } = setModule.state();
    // const { fakeDataClassList } = classModule.state();
    // const setId = fakeDataClassList.find(classItem => classItem.setRequestList.find(request => request.requestId === requestId)).setId;
    // const set = fakeDataListSet.find(setItem => setItem.id === setId);
    // return set;
};

export const acceptSetRequest = async (requestId, token) => {
    try {
        const response = await axios.put(`/set-request/accept/${requestId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
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
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
};

export const getAllPublicSet = async (page,size,name) => {
    try {
        const response = await axios.get('/set/public', {
            params: {
                page: page,
                size: size,
                name: name
            }
        });
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataListSet } = setModule.state();
    // const publicSets = fakeDataListSet.filter(setItem => setItem.privacyStatus == 'public');
    // return publicSets;
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

export const getRecentSet = async (token,page,size) => {
    try {
        const response = await axios.get('/set/recent', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                page: page,
                size: size
            }
        });
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataListSet } = setModule.state();
    // const recentSets = fakeDataListSet.slice(0, 5);
    // return recentSets;
}

export const getLibrarySet = async (token,page,size) => {
    try {
        const response = await axios.get('/set', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                page: page,
                size: size
            }
        });
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
}

export const getAllSets = async (token,name,page,size) => {
    try {
        const response = await axios.get('/set/search', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params:{
                name: name,
                page: page,
                size: size
            }
        });
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
}
