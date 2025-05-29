<script setup>
import { ref, defineEmits, defineProps, onMounted } from 'vue';
import OverlayBackground from '../components/OverlayBackground.vue';
import AddMember from './AddMember.vue';
import { createClass, updateClassName, getMemberList, deleteMember, updateMemberRole } from '@/apis/classApi';
import { getCurrentUser } from '@/apis/userApi';

// Định nghĩa các sự kiện emit gửi lên component cha
const emit = defineEmits(['close', 'save', 'reload']);
// Định nghĩa props nhận từ component cha
const props = defineProps(['isEditMode']);

// Trạng thái hiển thị modal (true: hiển thị, false: ẩn)
const visible = ref(true);
// Tên lớp học, lấy từ localStorage nếu ở chế độ chỉnh sửa
const className = ref(props.isEditMode ? localStorage.getItem('className') || '' : '');
// Danh sách thành viên của lớp
const memberList = ref([]);
// Danh sách ID người dùng được chọn để xóa
const selectedUsers = ref([]);
// Hiển thị cột chọn thành viên để xóa
const showSelectColumn = ref(false);
// Hiển thị modal thêm thành viên
const showAddMember = ref(false);
// ID của lớp học
const classId = ref(null);
// Token xác thực từ localStorage
const token = localStorage.getItem('token');
// Hiển thị cài đặt vai trò (admin/member)
const isDisplayRoleSetting = ref(false);
// Trạng thái đang tải dữ liệu
const isLoading = ref(false);
// Thông báo lỗi
const errorMessage = ref('');

// --- Biến phân trang ---
const membersPage = ref(0); // Trang hiện tại của danh sách thành viên
const membersSize = ref(10); // Số thành viên mỗi trang
const membersTotalPages = ref(0); // Tổng số trang
const membersTotalElements = ref(0); // Tổng số thành viên

// Hàm lưu hoặc cập nhật tên lớp học
const saveClassName = async () => {
  if (!className.value.trim()) {
    alert('Tên lớp không được để trống!');
    return;
  }

  // Tạo payload cho API
  const payload = {
    classId: props.isEditMode ? localStorage.getItem('classId') : null,
    name: className.value,
  };
  try {
    isLoading.value = true;
    let response;
    if (props.isEditMode) {
      // Cập nhật tên lớp nếu ở chế độ chỉnh sửa
      response = await updateClassName(payload, token);
      alert('Cập nhật lớp thành công.');
      localStorage.setItem('className', className.value); // Cập nhật localStorage
      emit('reload'); // Phát sự kiện reload
      await getMember(); // Tải lại danh sách thành viên
      isDisplayRoleSetting.value = true; // Hiển thị cài đặt vai trò
    } else {
      // Tạo lớp mới nếu không ở chế độ chỉnh sửa
      response = await createClass(payload, token);
      classId.value = response.classId; // Lưu ID lớp
      localStorage.setItem('classId', classId.value); // Lưu vào localStorage
      localStorage.setItem('className', className.value);
      emit('save', response); // Phát sự kiện lưu
      emit('reload'); // Phát sự kiện reload
      await getMember(); // Tải danh sách thành viên
      isDisplayRoleSetting.value = true; // Hiển thị cài đặt vai trò
    }
  } catch (error) {
    console.error('Lỗi khi lưu lớp:', error);
    alert('Lỗi khi lưu lớp: ' + (error.message || 'Lỗi không xác định'));
  } finally {
    isLoading.value = false; // Kết thúc tải
  }
};

// Hàm xóa thành viên đã chọn
const removeRow = async () => {
  if (selectedUsers.value.length === 0) {
    alert('Vui lòng chọn ít nhất một thành viên để xóa.');
    return;
  }

  const classId = localStorage.getItem('classId');
  if (!classId) {
    alert('Thiếu ID lớp. Vui lòng thử lại.');
    return;
  }

  try {
    isLoading.value = true;
    // Xóa từng thành viên được chọn
    for (const userId of selectedUsers.value) {
      await deleteMember(userId, classId, token);
    }
    alert('Xóa thành viên thành công.');
    selectedUsers.value = []; // Xóa danh sách đã chọn
    await getMember(); // Tải lại danh sách thành viên
    emit('reload'); // Phát sự kiện reload
  } catch (error) {
    console.error('Lỗi khi xóa thành viên:', error);
    alert('Lỗi khi xóa thành viên: ' + (error || 'Lỗi không xác định'));
  } finally {
    isLoading.value = false; // Kết thúc tải
  }
};

// Hàm đóng modal
const closeForm = () => {
  emit('close'); // Phát sự kiện đóng
  visible.value = false; // Ẩn modal
};

// Hàm chọn/bỏ chọn thành viên để xóa
const toggleSelectMember = (userId) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index === -1) {
    selectedUsers.value.push(userId); // Thêm ID vào danh sách
  } else {
    selectedUsers.value.splice(index, 1); // Xóa ID khỏi danh sách
  }
};

// Hàm bật/tắt cột chọn thành viên
const toggleSelectColumn = () => {
  showSelectColumn.value = !showSelectColumn.value;
};

// Hàm mở modal thêm thành viên
const openAddMember = () => {
  showAddMember.value = true; // Hiển thị modal thêm thành viên
  visible.value = false; // Ẩn modal chính
};

// Hàm đóng modal thêm thành viên
const closeAddMember = () => {
  getMember(); // Tải lại danh sách thành viên
  showAddMember.value = false; // Ẩn modal thêm thành viên
  visible.value = true; // Hiện lại modal chính
};

// Hàm cập nhật vai trò của thành viên
const updateRole = async (user) => {
  const payload = {
    userId: user.userId,
    classId: classId.value,
    role: user.role, // Vai trò mới (ADMIN hoặc MEMBER)
  };
  try {
    isLoading.value = true;
    await updateMemberRole(payload, token); // Gọi API cập nhật vai trò
    alert('Cập nhật vai trò thành công.');
  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò:', error);
    // Hoàn tác thay đổi vai trò nếu lỗi
    user.role = user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    alert('Lỗi khi cập nhật vai trò: ' + (error || 'Lỗi không xác định'));
  } finally {
    isLoading.value = false; // Kết thúc tải
  }
};

// Hàm lấy danh sách thành viên
const getMember = async () => {
  if (!classId.value) {
    console.warn('Không có classId');
    errorMessage.value = 'Thiếu ID lớp.';
    memberList.value = [];
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';
    // Gọi API lấy danh sách thành viên
    const response = await getMemberList(classId.value, token, membersPage.value, membersSize.value);
    console.log('Phản hồi API:', response);
    // Gán danh sách thành viên, đảm bảo là mảng
    memberList.value = Array.isArray(response.memberList) ? response.memberList : [];
    membersTotalPages.value = Number(response.totalPages) || 0; // Tổng số trang
    membersTotalElements.value = Number(response.totalElements) || 0; // Tổng số thành viên
    console.log('Danh sách thành viên:', memberList.value);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thành viên:', error);
    errorMessage.value = 'Lỗi khi tải danh sách thành viên: ' + (error.message || 'Lỗi không xác định');
    memberList.value = [];
  } finally {
    isLoading.value = false; // Kết thúc tải
  }
};

// Hàm thay đổi trang danh sách thành viên
const changeMembersPage = (newPage) => {
  if (newPage >= 0 && newPage < membersTotalPages.value && !isLoading.value) {
    membersPage.value = newPage; // Cập nhật trang
    getMember(); // Tải lại danh sách thành viên
  }
};

// Hàm tạo mảng số trang để hiển thị
const getPageNumbers = () => {
  const maxPagesToShow = 5; // Số trang tối đa hiển thị
  const totalPages = membersTotalPages.value; // Tổng số trang
  const currentPage = membersPage.value; // Trang hiện tại
  const pageNumbers = [];

  // Tính toán trang bắt đầu và kết thúc
  const startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow);

  for (let i = startPage; i < endPage; i++) {
    pageNumbers.push(i); // Thêm số trang vào mảng
  }
  return pageNumbers;
};

// Khi component được mount
onMounted(async () => {
  if (props.isEditMode) {
    // Nếu ở chế độ chỉnh sửa, lấy thông tin từ localStorage
    classId.value = localStorage.getItem('classId');
    className.value = localStorage.getItem('className') || '';
    if (!classId.value) {
      console.warn('Không tìm thấy classId trong localStorage');
      errorMessage.value = 'Không tìm thấy ID lớp. Vui lòng thử lại.';
      return;
    }
    await getMember(); // Tải danh sách thành viên
    if (memberList.value.length > 0) {
      try {
        // Lấy thông tin người dùng hiện tại
        const currentUser = await getCurrentUser(token);
        // Kiểm tra xem người dùng có phải admin không
        isDisplayRoleSetting.value = memberList.value.some(
            member => member.role === 'ADMIN' && member.userName === currentUser.username
        );
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error);
      }
    }
  }
});
</script>

<template>
  <OverlayBackground :isVisible="visible" @clickOverlay="closeForm" />
  <div v-if="visible" class="class-window">
    <div class="class-header">
      <div class="class-name">
        <label for="class-name">Class:</label>
        <input id="class-name" v-model="className" placeholder="Enter class name" />
      </div>
      <button @click="closeForm" class="close-btn">✖</button>
    </div>

    <div class="table-container">
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="isLoading" class="loading">Loading...</div>
      <table v-else class="class-table">
        <thead>
        <tr>
          <th v-if="showSelectColumn" class="select-column">Select</th>
          <th class="username-column">Username</th>
          <th class="role-column">Role</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in memberList" :key="row.userId">
          <td v-if="showSelectColumn">
            <input type="checkbox" @change="toggleSelectMember(row.userId)" :checked="selectedUsers.includes(row.userId)" />
          </td>
          <td class="username-column"><p>{{ row.userName }}</p></td>
          <td class="role">
            <p v-if="!isDisplayRoleSetting">{{ row.role }}</p>
            <select v-if="isDisplayRoleSetting" class="role-option" v-model="row.role" @change="updateRole(row)">
              <option value="ADMIN">ADMIN</option>
              <option value="MEMBER">MEMBER</option>
            </select>
          </td>
        </tr>
        <tr v-if="memberList.length === 0 && !isLoading && !errorMessage">
          <td :colspan="showSelectColumn ? 3 : 2">No members found.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="membersTotalPages > 1" class="pagination">
      <div class="pagination-info">
        Page {{ membersPage + 1 }} of {{ membersTotalPages }}
        (Total {{ membersTotalElements }} members)
      </div>
      <div class="pagination-controls">
        <button
            class="pagination-btn"
            @click="changeMembersPage(0)"
            :disabled="membersPage === 0 || isLoading"
        >
          First
        </button>
        <button
            class="pagination-btn"
            @click="changeMembersPage(membersPage - 1)"
            :disabled="membersPage === 0 || isLoading"
        >
          Prev
        </button>
        <button
            v-for="pageNum in getPageNumbers()"
            :key="pageNum"
            class="page-number-btn"
            :class="{ active: pageNum === membersPage }"
            @click="changeMembersPage(pageNum)"
            :disabled="isLoading"
        >
          {{ pageNum + 1 }}
        </button>
        <button
            class="pagination-btn"
            @click="changeMembersPage(membersPage + 1)"
            :disabled="membersPage >= membersTotalPages - 1 || isLoading"
        >
          Next
        </button>
        <button
            class="pagination-btn"
            @click="changeMembersPage(membersTotalPages - 1)"
            :disabled="membersPage >= membersTotalPages - 1 || isLoading"
        >
          Last
        </button>
      </div>
    </div>

    <div class="actions">
      <button @click="toggleSelectColumn" class="icon-button">
        <img src="../assets/select.svg" alt="Select" class="icon">
      </button>
      <button @click="removeRow" class="icon-button">
        <img src="../assets/delete-word.svg" alt="Delete" class="icon">
      </button>
      <button @click="openAddMember" class="icon-button">
        <img src="../assets/add-word.svg" alt="Add" class="icon">
      </button>
      <button @click="saveClassName" class="icon-button">
        <img src="../assets/save.svg" alt="Save" class="icon">
      </button>
    </div>
  </div>

  <AddMember :setName="className" v-if="showAddMember" @close="closeAddMember" />
</template>

<style scoped>
.class-window {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 40%;
  z-index: 1000;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-name {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.class-name input {
  margin-left: 10px;
  padding: 5px;
  border: 1px solid black;
  border-radius: 4px;
  text-align: center;
  width: 50%;
}

.table-container {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 20px;
  position: relative;
}

.class-table {
  width: 100%;
  border-collapse: collapse;
}

.class-table thead th {
  background-color: #A8D5E5;
  border: 1px solid black;
  position: sticky;
  top: 0;
  z-index: 1;
}

.class-table th, .class-table td {
  padding: 5px;
  border: 1px solid #ccc;
  text-align: center;
}

.role-option {
  width: 80px;
  height: 25px;
  cursor: pointer;
}

.select-column {
  width: 50px;
}

.username-column {
  width: 300px;
}

.role-column {
  width: 100px;
}

.username-column p {
  text-align: left;
  margin-left: 10px;
}

.actions {
  display: flex;
  justify-content: space-around;
  margin: 5px;
  margin-top: 15px;
}

.icon-button {
  cursor: pointer;
  width: 80px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  transition: transform 0.3s;
}

.icon-button:hover {
  transform: scale(1.05);
}

.icon {
  width: 100%;
  height: auto;
  cursor: pointer;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

td.role p {
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 10px;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 10px;
  color: #d32f2f;
  font-weight: bold;
}

/* Pagination Styles */
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  user-select: none;
}

.pagination-info {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-btn, .page-number-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover, .page-number-btn:hover {
  background-color: #e0e0e0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number-btn.active {
  background-color: black;
  color: white;
}
</style>