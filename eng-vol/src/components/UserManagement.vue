<script setup>
import { ref, onMounted } from 'vue'; // Import các hàm reactive và lifecycle hook từ Vue
import { getAllUsers, deleteUser, updateUserRole, updateUserPassword, reActivateUser } from '@/apis/userApi.js'; // Import các API liên quan đến người dùng

// Biến reactive để quản lý trạng thái và dữ liệu
const users = ref([]); // Danh sách người dùng
const search = ref(''); // Giá trị tìm kiếm
const page = ref(0); // Trang hiện tại
const size = ref(10); // Số lượng người dùng trên mỗi trang
const selectedUser = ref(null); // Người dùng được chọn để chỉnh sửa
const showPasswordModal = ref(false); // Trạng thái hiển thị modal đổi mật khẩu
const showRoleModal = ref(false); // Trạng thái hiển thị modal chỉnh sửa vai trò
const newPassword = ref(''); // Mật khẩu mới
const passwordError = ref(''); // Lỗi khi nhập mật khẩu
const isLoading = ref(false); // Trạng thái tải dữ liệu
const searchType = ref('all'); // Loại tìm kiếm ('all', 'username', hoặc 'email')
const newRole = ref('USER'); // Vai trò mới của người dùng

// Hàm lấy danh sách người dùng từ API
const fetchUsers = async () => {
  try {
    isLoading.value = true; // Bật trạng thái tải
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    const usersData = await getAllUsers(token, search.value, search.value, page.value, size.value); // Gọi API để lấy danh sách người dùng
    users.value = usersData.content; // Lưu danh sách người dùng vào biến reactive
    isLoading.value = false; // Tắt trạng thái tải
  } catch (error) {
    console.error('Error fetching users:', error); // Log lỗi nếu có
    isLoading.value = false; // Tắt trạng thái tải
  }
};

// Hàm mở modal đổi mật khẩu
const openPasswordModal = (user) => {
  selectedUser.value = user; // Lưu người dùng được chọn
  showPasswordModal.value = true; // Hiển thị modal đổi mật khẩu
  newPassword.value = ''; // Đặt lại giá trị mật khẩu mới
  passwordError.value = ''; // Đặt lại lỗi mật khẩu
};

// Hàm mở modal chỉnh sửa vai trò
const openRoleModal = (user) => {
  selectedUser.value = user; // Lưu người dùng được chọn
  showRoleModal.value = true; // Hiển thị modal chỉnh sửa vai trò
  newRole.value = user.role || 'USER'; // Đặt vai trò mặc định là 'USER' nếu không có
};

// Hàm xác nhận xóa người dùng
const confirmDelete = async (userId) => {
  if (confirm('Are you sure you want to delete this user?')) { // Hiển thị hộp thoại xác nhận
    try {
      const token = localStorage.getItem('token'); // Lấy token từ localStorage
      await deleteUser(token, userId); // Gọi API để xóa người dùng
      await fetchUsers(); // Làm mới danh sách người dùng
    } catch (error) {
      console.error('Error deleting user:', error); // Log lỗi nếu có
      alert('Unable to delete user. Please try again later.'); // Hiển thị thông báo lỗi
    }
  }
};

// Hàm xác nhận kích hoạt lại người dùng
const confirmReactivate = async (userId) => {
  if (confirm('Are you sure you want to reactivate this user?')) { // Hiển thị hộp thoại xác nhận
    try {
      const token = localStorage.getItem('token'); // Lấy token từ localStorage
      await reActivateUser(token, userId); // Gọi API để kích hoạt lại người dùng
      await fetchUsers(); // Làm mới danh sách người dùng
    } catch (error) {
      console.error('Error reactivating user:', error); // Log lỗi nếu có
      alert('Unable to reactivate user. Please try again later.'); // Hiển thị thông báo lỗi
    }
  }
};

// Hàm cập nhật mật khẩu
const updatePassword = async () => {
  if (!newPassword.value) { // Kiểm tra nếu mật khẩu mới bị bỏ trống
    passwordError.value = 'Please enter a new password'; // Hiển thị lỗi
    return;
  }

  try {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    alert(await updateUserPassword(token, selectedUser.value.id, newPassword.value)); // Gọi API để cập nhật mật khẩu và hiển thị thông báo
    showPasswordModal.value = false; // Đóng modal đổi mật khẩu
  } catch (error) {
    console.error('Error updating password:', error); // Log lỗi nếu có
    passwordError.value = 'Unable to update password. Please try again later.'; // Hiển thị lỗi
  }
};

// Hàm cập nhật vai trò
const updateRole = async () => {
  try {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    const roleId = newRole.value === 'ADMIN' ? 1 : 2; // Xác định ID vai trò dựa trên giá trị vai trò
    await updateUserRole(token, selectedUser.value.id, roleId); // Gọi API để cập nhật vai trò
    showRoleModal.value = false; // Đóng modal chỉnh sửa vai trò
    alert('Role updated successfully'); // Hiển thị thông báo thành công
    await fetchUsers(); // Làm mới danh sách người dùng
  } catch (error) {
    console.error('Error updating role:', error); // Log lỗi nếu có
    alert('Unable to update role. Please try again later.'); // Hiển thị thông báo lỗi
  }
};

// Hàm xử lý tìm kiếm
const handleSearch = () => {
  page.value = 0; // Đặt lại trang về 0 khi tìm kiếm
  fetchUsers(); // Gọi hàm lấy danh sách người dùng
};

// Lifecycle hook khi component được mount
onMounted(() => {
  fetchUsers(); // Lấy danh sách người dùng khi component được mount
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