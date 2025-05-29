<script setup>
// Import các component và module cần thiết
import Header from "@/components/Header.vue" // Header component
import ChangePassword from "@/components/ChangePassword.vue"; // Component để thay đổi mật khẩu
import {ref, onMounted} from 'vue' // Các hàm và biến reactive từ Vue
import { updateUserInfo, getCurrentUser } from "@/apis/userApi"; // API để lấy và cập nhật thông tin người dùng

// Biến reactive để kiểm soát hiển thị form thay đổi mật khẩu
const isChangePasswordVisible = ref(false);
const user = ref(''); // Biến reactive lưu thông tin người dùng

// Hàm lấy thông tin người dùng hiện tại từ API
const showCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    if (!token) {
      throw new Error('No token found'); // Nếu không có token, báo lỗi
    }
    const response = await getCurrentUser(token); // Gọi API để lấy thông tin người dùng
    user.value = response; // Cập nhật thông tin người dùng vào biến `user`
  } catch (err) {
    alert(err); // Hiển thị lỗi nếu có
  }
};

// Hàm được gọi khi component được mount
onMounted(async () => {
  const token = localStorage.getItem('token'); // Kiểm tra token trong localStorage
  if (token == null){
    console.log(token)
    alert('Login for to use this feature'); // Nếu không có token, yêu cầu đăng nhập
    window.location.href = '/login'; // Chuyển hướng đến trang đăng nhập
    return;
  }
  else await showCurrentUser(); // Nếu có token, hiển thị thông tin người dùng
});

// Hàm cập nhật thông tin người dùng
const updateProfile = async () => {
  try {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    const response = await updateUserInfo(user.value, token); // Gọi API để cập nhật thông tin người dùng
    alert(response) // Hiển thị thông báo kết quả
    await showCurrentUser(); // Cập nhật lại thông tin người dùng sau khi thay đổi
  } catch (error) {
    alert(error); // Hiển thị lỗi nếu có
  }
};

// Hàm hiển thị form thay đổi mật khẩu
const showChangePasswordForm = () => {
  isChangePasswordVisible.value = true; // Hiển thị form thay đổi mật khẩu
};

// Hàm xử lý khi đóng form thay đổi mật khẩu
const handleCloseChangePassword = () => {
  isChangePasswordVisible.value = false; // Ẩn form thay đổi mật khẩu
};
</script>

<template>
  <div class="user-profile-page">
    <!-- Hiển thị Header -->
    <Header></Header>
    <div class="profile-container">
      <main class="profile-content">
        <div class="profile-header">
          <!-- Hiển thị thông tin người dùng -->
          <div class="background"></div>
          <div class="avatar"></div>
          <h2>{{ user.username }}</h2>
        </div>
        <!-- Form cập nhật thông tin người dùng -->
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
            <!-- Nút hiển thị form thay đổi mật khẩu -->
            <button type="button" @click="showChangePasswordForm">Change password</button>
            <!-- Nút lưu thông tin -->
            <button type="submit">Save profile</button>
          </div>
        </form>
      </main>
    </div>
    <!-- Hiển thị form thay đổi mật khẩu nếu `isChangePasswordVisible` là true -->
    <ChangePassword
        v-if="isChangePasswordVisible"
        @close="handleCloseChangePassword"
    ></ChangePassword>
  </div>
</template>

<style scoped>
/* Các style cho trang profile */
.user-profile-page {
  display: flex;
  flex-direction: column;
  padding: 0 20vw;
}

.profile-content {
  flex: 1;
  margin-top: 50.67px;
}

.profile-header {
  width: 100%;
  align-items: center;
  margin-bottom: 20px;
}

.background {
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

.profile-header h2 {
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