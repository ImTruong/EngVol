<script setup>
  import OverlayBackground from './OverlayBackground.vue';
  import { defineEmits, reactive, ref } from 'vue';
  import { changePassword } from '@/apis/userApi';

  const emit = defineEmits(['close']);
  const visible = ref(true);

  let changePasswordRequest = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
  });

  // Phương thức đóng form
  const closeForm = () => {
      emit('close');
  };

  // Phương thức kiểm tra và gửi dữ liệu
  const saveData = async () => {
      const token = localStorage.getItem('token');
      try {
          const response = await changePassword(changePasswordRequest, token);
          alert(response);
          emit('close');
          closeForm();
      } catch (error) {
          alert(error);
      }
  };
</script>

<template>
    <OverlayBackground :isVisible="visible" @clickOverlay="closeForm"></OverlayBackground>
    <div class="container">
        <div class="header">
            <h1>Change password</h1>
        </div>
        <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeForm">
        <div class="password">
            <label>Current password</label>
            <input type="password" v-model="changePasswordRequest.oldPassword">
        </div>
        <div class="password">
            <label>New password</label>
            <input type="password" v-model="changePasswordRequest.newPassword">
        </div>
        <div class="password">
            <label>Confirm password</label>
            <input type="password" v-model="changePasswordRequest.confirmPassword">
        </div>

        <!-- Nút hành động -->
        <div class="button-container">
            <button @click="saveData">Save</button>
            <button @click="closeForm">Cancel</button>
        </div>
    </div>
</template>

<style scoped>
/* Đặt chung cho toàn bộ container */
.container {
    top: -400px;
    width: 400px;
    margin: auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 20;
}

/* Header */
.header {
    text-align: center;
    margin-bottom: 20px;
}

.close-icon {
    width: 24px;
    height: 24px;
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
}

/* Căn chỉnh các trường input */
.password {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}

.password label {
    margin-bottom: 5px;
    font-weight: 600;
}

.password input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
}

/* Button container */
.button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.button-container button {
    width: 48%;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.6);
}

.button-container button:last-child {
    background-color: #ffc1c1;
}

.button-container button:last-child:hover {
    background-color: #ff9191;
}

.button-container button:first-child {
    background-color: #9adfeb;
}

.button-container button:first-child:hover {
    background-color: #93fffa;
}
</style>