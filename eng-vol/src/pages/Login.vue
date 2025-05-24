<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { login } from '@/apis/userApi';

  const username = ref('');
  const password = ref('');
  const router = useRouter();

  const Login = async () => {
    if (!username.value.trim() || !password.value.trim()) {
      alert("Username và password không được để trống!");
      return;
    }
    try {
      const token = await login(username.value, password.value);
      localStorage.setItem('token', token);
      router.push('/');
    } catch (e) {
      alert(e.message);
    }
  };
</script>


<template>
  <div class="login-container">
    <div class="login-left"></div>
    <div class="login-right">
      <h2>Login</h2>
      <form @submit.prevent="Login">
        <div class="input-group">
          <label for="username">Username</label>
          <input type="text" id="username" v-model="username" placeholder="Email/username" required/>
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-button">Login</button>
      </form>
      <div class="signup">
        <span>New user? <router-link to="/signup">Sign up</router-link></span>
      </div>
    </div>
  </div>
</template>



<style scoped>
  .login-container {
    display: flex;
    height: 100vh;
    width: 100%;
  }

  .login-left {
    flex: 1;
    background-color: #d9f1f4;
  }

  .login-right {
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
    margin-bottom: 20px;
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

  .forgot-password {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    text-align: right;
  }

  .forgot-password a {
    color: #007bff;
    text-decoration: none;
  }

  .login-button {
    width: 100%;
    padding: 0.8rem;
    font-size: 1rem;
    color: #fff;
    background-color: #7fdff9;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 30px;
  }

  .login-button:hover {
    background-color: #6fd0e9;
  }

  .signup {
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .signup a {
    color: #007bff;
    text-decoration: none;
  }
</style>
