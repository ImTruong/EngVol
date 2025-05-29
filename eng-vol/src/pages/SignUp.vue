<script setup>
import router from '@/router/route'; // Import router để điều hướng giữa các trang
import axios from 'axios'; // Import thư viện axios để thực hiện các yêu cầu HTTP
import { reactive } from 'vue'; // Import hàm reactive từ Vue để tạo các biến reactive
import { register } from '@/apis/userApi'; // Import hàm register từ API để thực hiện đăng ký người dùng

// Tạo một đối tượng reactive để lưu thông tin đăng ký
const registerRequest = reactive({
  fullname: '', // Tên đầy đủ của người dùng
  username: '', // Tên đăng nhập của người dùng
  password: '', // Mật khẩu của người dùng
  email: '', // Email của người dùng
  country: '', // Quốc gia của người dùng
  message: '' // Thông báo lỗi hoặc trạng thái
});

// Hàm xử lý đăng ký người dùng
const registerUser = async () => {
  // Kiểm tra nếu các trường thông tin bị bỏ trống
  if (!registerRequest.fullname || !registerRequest.username || !registerRequest.password || !registerRequest.email || !registerRequest.country) {
    registerRequest.message = 'Please fill in all the fields.'; // Thông báo yêu cầu điền đầy đủ thông tin
    alert(registerRequest.message); // Hiển thị thông báo lỗi
    return; // Dừng thực hiện hàm
  }
  try {
    // Gửi yêu cầu POST đến API để đăng ký người dùng
    const response = await register(registerRequest);
    alert(response); // Hiển thị thông báo kết quả đăng ký
    router.push('/login'); // Điều hướng đến trang đăng nhập sau khi đăng ký thành công
  } catch (error) {
    alert(error); // Hiển thị lỗi nếu có
  }
};
</script>

<template>
  <div class="signup-container">
    <div class="signup-left"></div> <!-- Phần bên trái của giao diện -->
    <div class="signup-right">
      <h2>Register</h2> <!-- Tiêu đề -->
      <!-- Form đăng ký -->
      <form @submit.prevent="registerUser">
        <div class="input-group">
          <label for="fullname">Fullname</label> <!-- Nhãn cho trường tên đầy đủ -->
          <input type="text" id="fullname" v-model="registerRequest.fullname" placeholder="Enter your name without accents" required />
        </div>

        <div class="input-group">
          <label for="username">Username</label> <!-- Nhãn cho trường tên đăng nhập -->
          <input type="text" id="username" v-model="registerRequest.username" placeholder="Choose a username" required />
        </div>

        <div class="input-group">
          <label for="password">Password</label> <!-- Nhãn cho trường mật khẩu -->
          <input type="password" id="password" v-model="registerRequest.password" placeholder="Enter your password" required />
        </div>

        <div class="input-group">
          <label for="email">Email</label> <!-- Nhãn cho trường email -->
          <input type="email" id="email" v-model="registerRequest.email" placeholder="Enter your email address" required />
        </div>

        <div class="input-group">
          <label for="country">Country</label> <!-- Nhãn cho trường quốc gia -->
          <input type="text" id="country" v-model="registerRequest.country" placeholder="Enter your country" required />
        </div>

        <button type="submit" class="signup-button">Sign up</button> <!-- Nút đăng ký -->
      </form>
      <div class="login">
        <span>Already have an account? <router-link to="/login">Login</router-link></span> <!-- Liên kết đến trang đăng nhập -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  display: flex; /* Hiển thị dạng flexbox */
  height: 100vh; /* Chiều cao toàn màn hình */
  width: 100%; /* Chiều rộng toàn màn hình */
}

.signup-left {
  flex: 1; /* Phần bên trái chiếm 50% chiều rộng */
  background-color: #d9f1f4; /* Màu nền */
}

.signup-right {
  flex: 1; /* Phần bên phải chiếm 50% chiều rộng */
  display: flex; /* Hiển thị dạng flexbox */
  flex-direction: column; /* Sắp xếp theo chiều dọc */
  justify-content: center; /* Canh giữa theo chiều dọc */
  padding: 10vw; /* Khoảng cách padding */
}

h2 {
  font-weight: 400; /* Độ đậm của chữ */
  font-size: 40px; /* Kích thước chữ */
  margin-bottom: 20px; /* Khoảng cách dưới */
}

.input-group {
  width: 100%; /* Chiều rộng 100% */
  margin-bottom: 1rem; /* Khoảng cách dưới */
}

.input-group label {
  display: block; /* Hiển thị dạng khối */
  font-size: 0.9rem; /* Kích thước chữ */
  margin-bottom: 0.3rem; /* Khoảng cách dưới */
}

.input-group input {
  width: 100%; /* Chiều rộng 100% */
  padding: 0.8rem; /* Khoảng cách bên trong */
  border: 1px solid #ccc; /* Viền */
  border-radius: 4px; /* Bo góc */
  background-color: #eaf6f9; /* Màu nền */
}

.signup-button {
  width: 100%; /* Chiều rộng 100% */
  padding: 0.8rem; /* Khoảng cách bên trong */
  font-size: 1rem; /* Kích thước chữ */
  color: #fff; /* Màu chữ */
  background-color: #7fdff9; /* Màu nền */
  border: none; /* Không viền */
  border-radius: 4px; /* Bo góc */
  cursor: pointer; /* Con trỏ dạng nút */
}

.signup-button:hover {
  background-color: #6fd0e9; /* Màu nền khi hover */
}

.login {
  margin-top: 1rem; /* Khoảng cách trên */
  font-size: 0.9rem; /* Kích thước chữ */
}

.login a {
  color: #007bff; /* Màu chữ của liên kết */
  text-decoration: none; /* Không gạch chân */
}
</style>