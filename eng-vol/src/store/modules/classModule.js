import { getCurrentUserClasses } from "@/apis/classApi";

const state = function(){
    return {
      classes: [],
      fakeDataClassList: [
          {
            "classId": 1,
            "className": "Class 1",
            "numberOfMembers": 2,
            "numberOfSets": 0,
            "memberList": [
              {
                "userId": 1,
                "userName": "admin",
                "role": "ADMIN"
              },
              {
                "userId": 2,
                "userName": "user",
                "role": "MEMBER"
              }
            ],
            "invitationList": [
              {
                invitationId: 1,
                inviterId: 1,
                inviterName: "admin",
                inviteeId: 3,
                message: "admin" + " invites you to join class " + "Class 1",
              }
            ],
            "joinRequestList": [
              {
                requestId: 2,
                requesterId: 4,
                requesterName: "user3",
                message: "user3 requests to join class " + "Class 1",
              }
            ],
            "setRequestList":[
              {
                requestId: 1,
                setId: 1,
                requesterId: 2,
              }
            ]
          },
          {
            "classId": 2,
            "className": "Class 2",
            "numberOfMembers": 2,
            "numberOfSets": 0,
            "memberList": [
              {
                "userId": 3,
                "userName": "user1",
                "role": "ADMIN"
              },
              {
                "userId": 2,
                "userName": "user2",
                "role": "MEMBER"
              }
            ],
            "invitationList": [
              {
                invitationId: 3,
                inviterId: 3,
                inviterName: "user1",
                inviteeId: 1,
                message: "user1" + " invites you to join class " + "Class 2",
              }
            ],
            "joinRequestList": [
            ]
          },
          {
            "classId": 3,
            "className": "Class 3",
            "numberOfMembers": 2,
            "numberOfSets": 0,
            "memberList": [
              {
                "userId": 3,
                "userName": "user1",
                "role": "ADMIN"
              },
              {
                "userId": 1,
                "userName": "admin",
                "role": "MEMBER"
              }
            ],
            "invitationList": [
            ]
          },
          {
            "classId": 4,
            "className": "Class 4",
            "numberOfMembers": 1,
            "numberOfSets": 0,
            "memberList": [
              {
                "userId": 4,
                "userName": "user3",
                "role": "ADMIN"
              }
            ],
            "invitationList": [
            ],
            "joinRequestList": [
            ]
          },
          // {
          //   "classId": 5,
          //   "className": "Class 5",
          //   "numberOfMembers": 22,
          //   "numberOfSets": 0
          // }
      ],
    }
}

const mutations = {
  createClass(state, newClass) {
    const classId = state.fakeDataClassList.length + 1;
    const newClassData = {
        ...newClass, 
        classId, 
        memberList: [], 
        invitationList: [], 
        joinRequestList: [], 
        setRequestList: []
    };
    state.fakeDataClassList.push(newClassData);
  },
  updateClassName(state, payload) {
    const classIndex = state.fakeDataClassList.findIndex((classItem) => classItem.classId === payload.classId);
    state.fakeDataClassList[classIndex].className = payload.name;
  },
  deleteMember(state, userId, classId) {
    const classIndex = state.fakeDataClassList.findIndex((classItem) => classItem.classId === classId);
    const memberIndex = state.fakeDataClassList[classIndex].memberList.findIndex((member) => member.userId === userId);
    state.fakeDataClassList[classIndex].memberList.splice(memberIndex, 1);
  },
  updateMemberRole(state, payload) {
    const classIndex = state.fakeDataClassList.findIndex((classItem) => classItem.classId === payload.classId);
    const memberIndex = state.fakeDataClassList[classIndex].memberList.findIndex((member) => member.userId === payload.userId);
    state.fakeDataClassList[classIndex].memberList[memberIndex].role = payload.role;
  },
  inviteMember(state, {classId, inviteeUsername}) {
    for (let i = 0; i < state.fakeDataClassList.length; i++) {
      if (state.fakeDataClassList[i].classId === classId) {
        for (let j = 0; j < state.fakeDataClassList[i].memberList.length; j++) {
          if (state.fakeDataClassList[i].memberList[j].userName === inviteeUsername) {
            return;
          }
        }
        const newInvitation = {
          invitationId: 3,
          inviterId: 1,
          inviterName: "admin",
          inviteeId: 4,
          message: "admin invites you to join class " + "Class 1",
        }
        state.fakeDataClassList[i].invitationList.push(newInvitation);
        return;
      }
    }
  },
  revokeInvitation(state, invitationId) {
    for (let i = 0; i < state.fakeDataClassList.length; i++) {
      const index = state.fakeDataClassList[i].invitationList.findIndex((invitation) => invitation.invitationId === invitationId);
      if (index !== -1) {
        state.fakeDataClassList[i].invitationList.splice(index, 1);
        return
      }
    }
  },
  leaveClass(state, classId){
    const classIndex = state.fakeDataClassList.findIndex((classItem) => classItem.classId === classId);
    const memberIndex = state.fakeDataClassList[classIndex].memberList.findIndex((member) => member.userId === 1);
    state.fakeDataClassList[classIndex].memberList.splice(memberIndex, 1);
  },
  joinClass(state, classId, userId){
    const classIndex = state.fakeDataClassList.findIndex((classItem) => classItem.classId === classId);
    const checkExist = state.fakeDataClassList[classIndex].joinRequestList.find((request) => request.requesterId === userId);
    if (!checkExist) {
      const newRequest = {
        requestId: 1,
        requesterId: userId,
        requesterName: "admin",
        message: "admin requests to join class " + fakeDataClassList[classIndex].className,
      }
      state.fakeDataClassList[classIndex].joinRequestList.push(newRequest);
    }
  },
  revokeJoinRequest(state, requestId){
    state.fakeDataClassList.forEach(classItem => {
        if (classItem.joinRequestList) {
            const index = classItem.joinRequestList.findIndex(request => request.requestId === requestId);
            if (index !== -1) {
                classItem.joinRequestList.splice(index, 1);
            }
        }
    });
  },
  //real
  setClasses(state, classes) {
    state.classes = classes;
  }
};

const actions = {
  createClass(context, newClass) {
    context.commit("createClass", newClass);
    return context.state.fakeDataClassList[context.state.fakeDataClassList.length - 1];
  },
  updateClassName(context, payload) {
      context.commit("updateClassName", payload);
  },
  deleteMember(context, userId, classId) {
    context.commit("deleteMember", userId, classId);
  },
  updateMemberRole(context, payload) {
    context.commit("updateMemberRole", payload);
  },
  inviteMember(context, classId, inviteeUsername) {
    context.commit("inviteMember", {classId, inviteeUsername});
  },
  revokeInvitation(context, invitationId) {
    context.commit("revokeInvitation", invitationId);
  },
  leaveClass(context, classId){
    context.commit("leaveClass", classId);
  },
  joinClass(context, classId, userId){
    context.commit("joinClass", classId, userId);
  },
  revokeJoinRequest(context, requestId){
    context.commit("revokeJoinRequest", requestId);
  },
  //real
  // async fetchClassData(context) {
  //   const classes =  await getCurrentUserClasses("fake token");
  //   context.commit("setClasses", classes);
  //   return classes;
  // }
};

const getters = {
  getClasses: (state) => state.classes 
};

export default {
    namespaced: true,
    actions,
    state,
    mutations,
    getters
}