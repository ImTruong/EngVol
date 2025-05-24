<script setup>
import { ref, onMounted } from 'vue';
import { getAllUsers, deleteUser, updateUserRole, updateUserPassword, reActivateUser } from '@/apis/userApi.js';

const users = ref([]);
const search = ref('');
const page = ref(0);
const size = ref(10);
const selectedUser = ref(null);
const showPasswordModal = ref(false);
const showRoleModal = ref(false);
const newPassword = ref('');
const passwordError = ref('');
const isLoading = ref(false);
const searchType = ref('all'); // 'all', 'username', or 'email'
const newRole = ref('USER'); // Added this missing variable

const fetchUsers = async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const usersData = await getAllUsers(token, search.value, search.value, page.value, size.value);
    users.value = usersData.content;
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching users:', error);
    isLoading.value = false;
  }
};

const openPasswordModal = (user) => {
  selectedUser.value = user;
  showPasswordModal.value = true;
  newPassword.value = '';
  passwordError.value = '';
};

const openRoleModal = (user) => {
  selectedUser.value = user;
  showRoleModal.value = true;
  newRole.value = user.role || 'USER';
};

const confirmDelete = async (userId) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      const token = localStorage.getItem('token');
      await deleteUser(token, userId);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Unable to delete user. Please try again later.');
    }
  }
};

const confirmReactivate = async (userId) => {
  if (confirm('Are you sure you want to reactivate this user?')) {
    try {
      const token = localStorage.getItem('token');
      await reActivateUser(token, userId);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error reactivating user:', error);
      alert('Unable to reactivate user. Please try again later.');
    }
  }
};

const updatePassword = async () => {
  if (!newPassword.value) {
    passwordError.value = 'Please enter a new password';
    return;
  }

  try {
    const token = localStorage.getItem('token');
    alert(await updateUserPassword(token, selectedUser.value.id, newPassword.value));
    showPasswordModal.value = false;
  } catch (error) {
    console.error('Error updating password:', error);
    passwordError.value = 'Unable to update password. Please try again later.';
  }
};

const updateRole = async () => {
  try {
    const token = localStorage.getItem('token');
    const roleId = newRole.value === 'ADMIN' ? 1 : 2;
    await updateUserRole(token, selectedUser.value.id, roleId);
    showRoleModal.value = false;
    alert('Role updated successfully');
    await fetchUsers(); // Refresh the list
  } catch (error) {
    console.error('Error updating role:', error);
    alert('Unable to update role. Please try again later.');
  }
};

const handleSearch = () => {
  page.value = 0; // Reset to first page when searching
  fetchUsers();
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-management">
    <h2>User Management</h2>

    <div class="search-container">
      <div class="search-options">
        <select v-model="searchType">
          <option value="all">All Fields</option>
          <option value="username">Username</option>
          <option value="email">Email</option>
        </select>
        <input
            type="text"
            v-model="search"
            placeholder="Search users..."
            @keyup.enter="handleSearch"
        >
        <button @click="handleSearch" class="search-btn">Search</button>
      </div>
    </div>

    <div class="loading" v-if="isLoading">Loading...</div>

    <div class="users-table" v-else>
      <table>
        <thead>
        <tr>
          <th>ID</th>
          <th>Full Name</th>
          <th>Username</th>
          <th>Email</th>
          <th>Country</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.fullName }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.country || 'Not specified' }}</td>
          <td>{{ user.role || 'USER' }}</td>
          <td>
            <span class="status" :class="{ 'deleted': user.deleted }">
              {{ user.deleted ? 'Deleted' : 'Active' }}
            </span>
          </td>
          <td class="actions">
            <button class="edit-btn" @click="openPasswordModal(user)" :disabled="user.deleted">Change Password</button>
            <button class="role-btn" @click="openRoleModal(user)" :disabled="user.deleted">Edit Role</button>
            <button v-if="!user.deleted" class="delete-btn" @click="confirmDelete(user.id)">Delete</button>
            <button v-else class="reactivate-btn" @click="confirmReactivate(user.id)">Reactivate</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button
          :disabled="page === 0"
          @click="page--; fetchUsers();"
      >Previous Page</button>
      <span>Page {{ page + 1 }}</span>
      <button
          :disabled="users.length < size"
          @click="page++; fetchUsers();"
      >Next Page</button>
    </div>

    <!-- Password Change Modal -->
    <div class="modal" v-if="showPasswordModal">
      <div class="modal-content">
        <span class="close" @click="showPasswordModal = false">&times;</span>
        <h3>Change Password for {{ selectedUser?.fullName }}</h3>
        <div class="form-group">
          <label>New Password:</label>
          <input type="password" v-model="newPassword">
        </div>
        <div class="error" v-if="passwordError">{{ passwordError }}</div>
        <div class="form-actions">
          <button class="cancel-btn" @click="showPasswordModal = false">Cancel</button>
          <button class="confirm-btn" @click="updatePassword">Confirm</button>
        </div>
      </div>
    </div>

    <!-- Role Update Modal -->
    <div class="modal" v-if="showRoleModal">
      <div class="modal-content">
        <span class="close" @click="showRoleModal = false">&times;</span>
        <h3>Update Role for {{ selectedUser?.fullName }}</h3>
        <div class="form-group">
          <label>Role:</label>
          <select v-model="newRole">
            <option value="USER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="cancel-btn" @click="showRoleModal = false">Cancel</button>
          <button class="confirm-btn" @click="updateRole">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-management {
  width: 100%;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 20px;
}

.search-options {
  display: flex;
  gap: 10px;
}

.search-options select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-options input {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-btn {
  padding: 8px 15px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.users-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f8f8;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .role-btn, .delete-btn, .reactivate-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background-color: #4CAF50;
  color: white;
}

.role-btn {
  background-color: #2196F3;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.reactivate-btn {
  background-color: #FF9800;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.modal {
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  position: relative;
}

.close {
  position: absolute;
  right: 15px;
  top: 10px;
  font-size: 24px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error {
  color: red;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f1f1f1;
}

.confirm-btn {
  background-color: #4CAF50;
  color: white;
}

.status {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #4CAF50;
  color: white;
}

.status.deleted {
  background-color: #f44336;
}
</style>