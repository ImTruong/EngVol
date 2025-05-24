const state = function(){
    return {
        fakeDataUserList: [
            {
              "username": "admin",
              "email": "john.doe@example.com",
              "password": "123456",
              "fullName": "John Doe",
              "country": "USA"
            },
            {
              "username": "user",
              "email": "alice.smith@example.com",
              "password": "123456",
              "fullName": "Alice Smith",
              "country": "Canada"
            },
            {
              "username": "user1",
              "email": "michael.j@example.com",
              "password": "123456",
              "fullName": "Michael Johnson",
              "country": "UK"
            },
            {
              "username": "sophia_w",
              "email": "sophia.w@example.com",
              "password": "123456",
              "fullName": "Sophia Williams",
              "country": "Australia"
            },
            {
              "username": "daniel_b",
              "email": "daniel.b@example.com",
              "password": "123456",
              "fullName": "Daniel Brown",
              "country": "Germany"
            }
        ]
    }
}

const mutations = {
  addUser(state, user) {
      state.fakeDataUserList.push(user);
  },
  changePassword(state, password) {
      const user = state.fakeDataUserList.find(user => user.username === "admin");
      user.password = password;
  }
};

const actions = {
  addUser(context, user) {
      context.commit("addUser", user);
  },
  changePassword(context, password) {
      context.commit("changePassword", password);
  }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
}