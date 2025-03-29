<script setup>
import router from '@/router/route';
import axios from 'axios';
import { reactive } from 'vue';
import { register } from '@/apis/userApi';

const registerRequest = reactive({
  fullname: '',
  username: '',
  password: '',
  email: '',
  country: '',
  message: ''
});

// Hàm đăng ký người dùng
const registerUser = async () => {
  if (!registerRequest.fullname || !registerRequest.username || !registerRequest.password || !registerRequest.email || !registerRequest.country) {
    registerRequest.message = 'Please fill in all the fields.';
    alert(registerRequest.message);
    return;
  }
  try {
    // Gửi yêu cầu POST đến API
    const response = await register(registerRequest);
    alert(response);
    router.push('/login');
  } catch (error) {
    alert(error);
  }
};
</script>

<template>
  <div class="signup-container">
    <div class="signup-left"></div>
    <div class="signup-right">
      <h2>Register</h2>
      <form @submit.prevent="registerUser">
        <div class="input-group">
          <label for="fullname">Fullname</label>
          <input type="text" id="fullname" v-model="registerRequest.fullname" placeholder="Enter your name without accents" required />
        </div>

        <div class="input-group">
          <label for="username">Username</label>
          <input type="text" id="username" v-model="registerRequest.username" placeholder="Choose a username" required />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="registerRequest.password" placeholder="Enter your password" required />
        </div>

        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="registerRequest.email" placeholder="Enter your email address" required />
        </div>

        <div class="input-group">
          <label for="country">Country</label>
          <input type="text" id="country" v-model="registerRequest.country" placeholder="Enter your country" required />
        </div>

        <button type="submit" class="signup-button">Sign up</button>
      </form>
      <div class="login">
        <span>Already have an account? <router-link to="/login">Login</router-link></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.signup-left {
  flex: 1;
  background-color: #d9f1f4;
}

.signup-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10vw;
}

h2 {
  font-weight: 400;
  font-size: 40px;
  margin-bottom: 20px;
}

.input-group {
  width: 100%;
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.input-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #eaf6f9;
}

.signup-button {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  color: #fff;
  background-color: #7fdff9;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.signup-button:hover {
  background-color: #6fd0e9;
}

.login {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.login a {
  color: #007bff;
  text-decoration: none;
}
</style>