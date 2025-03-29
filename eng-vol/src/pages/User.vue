<script setup>
  import Header from "@/components/Header.vue"
  import ChangePassword from "@/components/ChangePassword.vue";
  import {ref, onMounted} from 'vue'
  import { updateUserInfo, getCurrentUser } from "@/apis/userApi";

  const isChangePasswordVisible = ref(false);
  const user = ref('');

  const showCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await getCurrentUser(token);
      user.value = response;
    } catch (err) {
      alert(err);
    }
  };

  onMounted(async () => {
    await showCurrentUser();
  });

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await updateUserInfo(user, token);
      alert(response);
      await showCurrentUser();
    } catch (error) {
      alert(error);
    }
  };


  // Phương thức hiển thị form ChangePassword
const showChangePasswordForm = () => {
  isChangePasswordVisible.value = true;
};

// Phương thức xử lý khi đóng form ChangePassword
const handleCloseChangePassword = () => {
  isChangePasswordVisible.value = false;
};


</script>


<template>
    <div class="user-profile-page">
       <Header></Header>
      <div class="profile-container">
        <main class="profile-content">
          <div class="profile-header">
            <div class="background"></div>
            <div class="avatar"></div>
            <h2>{{ user.username }}</h2>
          </div>
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="name">Fullname</label>
              <input v-model="user.fullName" id="name" type="text" />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              
                <input v-model="user.email" id="email" type="email" />
              
            </div>
            <div class="form-group">
              <label for="country">Country</label>
              <input v-model="user.country" id="country" type="text" />
            </div>
            <div class="actions">
              <button type="button" @click="showChangePasswordForm">Change password</button>
              <button type="submit">Save profile</button>
            </div>


          </form>
        </main>
      </div>
      <ChangePassword
        v-if="isChangePasswordVisible"
        @close="handleCloseChangePassword"
    ></ChangePassword>
    </div>
  </template>
  

  
<style scoped>
  .user-profile-page {
    display: flex;
    flex-direction: column;
    padding: 0 20vw;
  }

  .profile-content {
    flex: 1;
    margin-top: 50.67px;
    /* max-width: ; */
  }
  
  .profile-header {
    width: 100%;
    /* display: flex; */
    align-items: center;
    margin-bottom: 20px;
    /* background-color: #007bff; */
    /* height: 150px; */
  }
  
  .background{
    background-color: #cacaca;
    height: 150px;
    width: 100%;
  }

  
  .avatar {
    margin: -50px 0px 0px 20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #d9ecf2;
  }

  .profile-header h2{
    /* margin-top: -80px; */
    margin: -65px 0 50px 105px ;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .user-email{
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
  }
  
  .actions button {
    padding: 10px 15px;
    border: none;
    background-color: #b5f4ff;
    color: rgb(0, 0, 0);
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
  }

  .actions button:hover {
    transform: scale(1.05);
  }
  
  .actions button:first-of-type {
    background-color: #97a3ad;
    color: white;
  }
</style>
  