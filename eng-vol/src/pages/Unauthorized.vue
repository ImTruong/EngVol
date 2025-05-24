<template>
  <div class="unauthorized-container">
    <div class="unauthorized-box">
      <h1>Access Denied</h1>
      <div class="icon-container">
        <i class="fas fa-lock"></i>
      </div>
      <p>You don't have permission to access the management page.</p>
      <p>This area is restricted to administrators only.</p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary">Return to Home</router-link>
        <router-link to="/login" class="btn btn-secondary">Login with a different account</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Unauthorized'
}
</script>

<style scoped>
.unauthorized-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.unauthorized-box {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

h1 {
  color: #d32f2f;
  margin-bottom: 20px;
}

.icon-container {
  margin: 20px 0;
  font-size: 64px;
  color: #d32f2f;
}

p {
  margin-bottom: 10px;
  color: #666;
  font-size: 16px;
}

.actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}
</style>