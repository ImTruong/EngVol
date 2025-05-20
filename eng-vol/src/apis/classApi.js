// fake data
import store from '@/store';
import classModule from '@/store/modules/classModule';
// end fake data

export const getClassesByName = async (name,token) => {
    // const response = await axios({
    //     method: 'GET',
    //     url: `class?name=${name}`,
    //     headers: { Authorization: `Bearer ${token}`}
    // })
    // if(response.status === 200 || response.isSuccess){
    //     return response.data
    // }else{
    //     throw new Error(response.message)
    // }
    const { fakeDataClassList } = classModule.state();
    const filteredClasses = fakeDataClassList.filter(classItem => classItem.className.toLowerCase().includes(name.toLowerCase()));
    return filteredClasses;
}

export const checkInviteExistance = async (inviteeUsername, classId, token) => {
    // try {
    //     const response = await axios.get(`/class/invitation/existence`, {
    //         params: {
    //             inviteeUsername: inviteeUsername,
    //             classId: classId,
    //         },
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error while calling API:', error);
    //     throw error;
    // }
    const { fakeDataClassList } = classModule.state();
    for (let i = 0; i < fakeDataClassList.length; i++) {
        if (fakeDataClassList[i].classId === classId) {
            for (let j = 0; j < fakeDataClassList[i].invitationList.length; j++) {
                if (fakeDataClassList[i].invitationList[j].inviteeUsername === inviteeUsername) {
                    return fakeDataClassList[i].invitationList[j].invitationId;
                }
            }
        }
    }
    return null
};

export const inviteUser = async (classId, inviteeUsername, token) => {
    // try {
    //     const response = await axios.post(`/class/invitation?classId=${classId}&inviteeUsername=${inviteeUsername}`, {
    //         classId: classId,
    //         inviteeUsername: inviteeUsername,
    //     }, 
    //     {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error while calling API:', error);
    //     throw error;
    // }
    const { fakeDataClassList } = store.state.classModule;
    store.dispatch('classModule/inviteMember', {classId, inviteeUsername});
    return 'Invite successfully';
    
        
    
};

// Thu hồi lời mời
export const revokeUser = async (invitationId, token) => {
    // try {
    //     const response = await axios.delete(`/class/invitation/revoke?invitationId=${invitationId}`, {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    store.dispatch('classModule/revokeInvitation', invitationId);
    return "Revoke invitation successfully";
};

import axios from 'axios';

// Tạo lớp học mới
export const createClass = async (payload, token) => {
    // try {
    //     const response = await axios.post('/class', payload, {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    const fakeDataClassList = classModule.state().fakeDataClassList;
    const newClass = {
        classId: fakeDataClassList.length + 1,
        className: payload.name,
        numberOfMembers: 1,
        numberOfSets: 0,
        memberList: [
            {
                userId: 1,
                userName: 'admin',
                role: 'ADMIN'
            }
        ]
    };
    store.dispatch('classModule/createClass', newClass);
    return newClass;
};

// Cập nhật tên lớp học
export const updateClassName = async (payload, token) => {
    // try {
    //     const response = await axios.put('/class/update/name', payload, {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    store.dispatch('classModule/updateClassName', payload);
    return "Update class name successfully";
};

// Lấy danh sách thành viên
export const getMemberList = async (classId, token) => {
    // try {
    //     const response = await axios.get(`/class/member/list?classId=${classId}`, {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    const fakeDataClassList = classModule.state().fakeDataClassList;
    const classIndex = fakeDataClassList.findIndex(classItem => classItem.classId == classId);
    return fakeDataClassList[classIndex].memberList;
};

// Xóa thành viên
export const deleteMember = async (userId, classId, token) => {
    // try {
    //     const response = await axios.delete(`/class/member/delete?userId=${userId}&classId=${classId}`, {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    store.dispatch('classModule/deleteMember', userId, classId);
    return null;
};

// Cập nhật vai trò thành viên
export const updateMemberRole = async (payload, token) => {
    // try {
    //     const response = await axios.put('/class/member/role', payload, {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    store.dispatch('classModule/updateMemberRole', payload);
};

export const getCurrentUserClasses = async (token) => {
    // try {
    //     const response = await axios.get('/class/user', {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
    const { fakeDataClassList } = classModule.state();
    return fakeDataClassList.filter(classItem => classItem.memberList.find(member => member.userId === 1));
};

export const leaveClass = async (classId, token) => {
    try {
        const response = await axios.delete(`/class/member/leave`, {
            params: {
                classId: classId,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error leaving class:', error);
        throw error;
    }
};

export const joinClass = async (classId, userId, token) => {
    // try {
    //     const response = await axios.post(`/class/request/join`, {
    //         classId: classId,
    //         userId: userId
    //     }, {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });
    //     return {
    //         isSuccess: response.data.isSuccess,
    //         message: response.data.message
    //     };
    // } catch (error) {
    //     console.error('Error joining class:', error);
    //     throw error;
    // }
    const { fakeDataClassList } = classModule.state();
    store.dispatch('classModule/joinClass', classId, userId);
    return {
        isSuccess: true,
        message: 'Join request sent successfully'
    }
};

export const revokeJoinRequest = async (joinRequestId, token) => {
    // try {
    //     const response = await axios.delete(`/class/request/join/revoke`, {
    //         params: {
    //             classJoinRequestId: joinRequestId,
    //         },
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });
    //     return {
    //         isSuccess: response.data.isSuccess,
    //         message: response.data.message
    //     };
    // } catch (error) {
    //     console.error('Error revoking join request:', error);
    //     throw error;
    // }
    store.dispatch('classModule/revokeJoinRequest', joinRequestId);
    return {
        isSuccess: true,
        message: 'Revoke join request successfully'
    };
};

export const getJoinRequest = async (classId, token) => {
    // try {
    //     const response = await axios.get(`/class/request/join/existence`, {
    //         params: {
    //             classId: classId,
    //         },
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });
    //     return response.data.isSuccess;
    // } catch (error) {
    //     console.error('Error fetching join request:', error);
    //     throw error;
    // }
    const { fakeDataClassList } = classModule.state();
    const classItem = fakeDataClassList.find(classItem => classItem.classId === classId);
    const index = classItem.joinRequestList.indexOf(request => request.requesterId === 1);
    if (index !== -1) {
        return {
            isSuccess: true,
            classJoinRequestId: classItem.joinRequestList[index].requestId
        }
    }
    return {
        isSuccess: false,
        classJoinRequestId: null
    }
};

// Lấy thông tin yêu cầu tham gia hoặc lời mời
export const getRequest = async (apiUrl, token) => {
    // try {
    //     const response = await axios.get(apiUrl, {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     });
    //     return response.data;
    // } catch (error) {
    //     console.error('Error fetching request:', error);
    //     throw error;
    // }
    const requestId = apiUrl.split('/').pop();
    if (requestId === "2"){
        return {
            requestId: 2,
            requesterId: 4,
            requesterName: "user3",
            message: "user3 requests to join class Class 1",
        }
    }else if (requestId === "3"){
        return {
            requestId: 3,
            inviterId: 3,
            inviterUsername: "user1",
            inviteeId: 1,
            message: "user1 invites you to join class Class 2",
        }
    }


};

// Chấp nhận yêu cầu tham gia hoặc lời mời
export const handleAccept = async (apiUrl, token) => {
    try {
        const response = await axios.post(apiUrl, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error accepting request:', error);
        throw error;
    }
};

// Từ chối yêu cầu tham gia hoặc lời mời
export const handleReject = async (apiUrl, token) => {
    try {
        const response = await axios.delete(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error rejecting request:', error);
        throw error;
    }
};