<script setup>
import ClassModal from '@/components/ClassModal.vue'; // Import component ClassModal để hiển thị modal thông tin lớp học
import SetBox from "@/components/SetBox.vue"; // Import component SetBox để hiển thị thông tin bộ flashcard
import ClassTable from '@/components/ClassTable.vue'; // Import component ClassTable để hiển thị bảng thông tin lớp học
import UserManagement from '@/components/UserManagement.vue'; // Import component UserManagement để quản lý người dùng
import { getAllClasses } from "@/apis/classApi.js"; // Import API để lấy danh sách lớp học
import { getAllSets } from "@/apis/setApi.js"; // Import API để lấy danh sách bộ flashcard
import { ref } from "vue"; // Import hàm ref từ Vue để tạo biến reactive
import { onMounted, onUnmounted } from "vue"; // Import các lifecycle hooks từ Vue

// Biến reactive để quản lý trạng thái modal và tab
const classModalMode = ref(false); // Trạng thái hiển thị modal lớp học
const classTableMode = ref(false); // Trạng thái hiển thị bảng lớp học
const activeTab = ref("Flashcard sets"); // Tab hiện tại
const classes = ref(null); // Danh sách lớp học
const sets = ref(null); // Danh sách bộ flashcard
const search = ref(""); // Giá trị tìm kiếm

// Phân trang cho bộ flashcard
const setsPage = ref(0); // Trang hiện tại của bộ flashcard
const setsSize = ref(10); // Số lượng bộ flashcard trên mỗi trang
const setsTotalPages = ref(0); // Tổng số trang của bộ flashcard
const setsTotalElements = ref(0); // Tổng số bộ flashcard

// Phân trang cho lớp học
const classesPage = ref(0); // Trang hiện tại của lớp học
const classesSize = ref(10); // Số lượng lớp học trên mỗi trang
const classesTotalPages = ref(0); // Tổng số trang của lớp học
const classesTotalElements = ref(0); // Tổng số lớp học

let intervalId = null; // ID của interval để làm mới dữ liệu

// Hàm lấy dữ liệu từ API
const fetchData = async (token) => {
  try {
    // Lấy dữ liệu bộ flashcard với phân trang
    if (activeTab.value === "Flashcard sets" || activeTab.value === "Classes") {
      const setsData = await getAllSets(token, search.value, setsPage.value, setsSize.value);
      sets.value = setsData.content; // Lưu danh sách bộ flashcard
      setsTotalPages.value = setsData.totalPages; // Cập nhật tổng số trang
      setsTotalElements.value = setsData.totalElements; // Cập nhật tổng số phần tử
    }

    // Lấy dữ liệu lớp học với phân trang
    if (activeTab.value === "Flashcard sets" || activeTab.value === "Classes") {
      const classesData = await getAllClasses(token, search.value, classesPage.value, classesSize.value);
      classes.value = classesData.content; // Lưu danh sách lớp học
      classesTotalPages.value = classesData.totalPages; // Cập nhật tổng số trang
      classesTotalElements.value = classesData.totalElements; // Cập nhật tổng số phần tử
    }
  } catch (error) {
    console.error("Error fetching data:", error); // Log lỗi nếu có
  }
};

// Hàm xử lý thay đổi trang của bộ flashcard
const changeSetsPage = (newPage) => {
  setsPage.value = newPage; // Cập nhật trang hiện tại
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  fetchData(token); // Gọi hàm fetchData để lấy dữ liệu mới
};

// Hàm xử lý thay đổi trang của lớp học
const changeClassesPage = (newPage) => {
  classesPage.value = newPage; // Cập nhật trang hiện tại
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  fetchData(token); // Gọi hàm fetchData để lấy dữ liệu mới
};

// Lifecycle hook khi component được mount
onMounted(() => {
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  fetchData(token); // Lấy dữ liệu ban đầu

  intervalId = setInterval(() => {
    fetchData(token); // Làm mới dữ liệu mỗi 3 giây
  }, 3000);
});

// Lifecycle hook khi component bị unmount
onUnmounted(() => {
  clearInterval(intervalId); // Dọn dẹp interval
});

// Hàm hiển thị modal lớp học
const showClassModal = (classItem) => {
  classModalMode.value = true; // Bật modal
  localStorage.setItem('classId', classItem.classId); // Lưu ID lớp học vào localStorage
  localStorage.setItem('className', classItem.className); // Lưu tên lớp học vào localStorage
};

// Hàm đóng overlay
function closeOverlay() {
  emit('close'); // Phát sự kiện đóng
  isMember.value = false; // Đặt lại trạng thái thành viên
}

// Hàm chuyển tab
const switchTab = (tabName) => {
  activeTab.value = tabName; // Cập nhật tab hiện tại
  if (tabName === "User Management") {
    search.value = ""; // Xóa giá trị tìm kiếm
  } else {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    setsPage.value = 0; // Reset trang của bộ flashcard
    classesPage.value = 0; // Reset trang của lớp học
    fetchData(token); // Làm mới dữ liệu
  }
};

// Hàm tìm kiếm
const handleSearch = () => {
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  setsPage.value = 0; // Reset trang của bộ flashcard
  classesPage.value = 0; // Reset trang của lớp học
  fetchData(token); // Làm mới dữ liệu
};

// Hàm xử lý khi nhấn Enter trong input tìm kiếm
const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    handleSearch(); // Gọi hàm tìm kiếm
  }
};

// Hàm kiểm tra xem có hiển thị thanh tìm kiếm hay không
const showSearchBar = () => {
  return activeTab.value !== "User Management"; // Hiển thị thanh tìm kiếm nếu không phải tab User Management
};
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <img src="../assets/logo.svg" alt="Admin Logo" class="logo-img" />
        <h2>Admin Panel</h2>
      </div>
      <nav class="nav-menu">
        <button :class="{ active: activeTab === 'Flashcard sets' }" @click="switchTab('Flashcard sets')">
          Flashcard Sets
        </button>
        <button :class="{ active: activeTab === 'Classes' }" @click="switchTab('Classes')">
          Classes
        </button>
        <button :class="{ active: activeTab === 'User Management' }" @click="switchTab('User Management')">
          User Management
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header">
        <div v-if="showSearchBar()" class="search-container">
          <input
              type="text"
              v-model="search"
              placeholder="Search..."
              class="search-input"
              @keydown="handleKeyDown"
          />
          <button class="search-button" @click="handleSearch">
            <img src="../assets/search_icon.svg" alt="Search" class="search-icon" />
          </button>
        </div>
      </header>

      <div class="content">
        <!-- Tab Flashcard sets -->
        <div class="sets-list" v-if="activeTab === 'Flashcard sets'">
          <div class="sets-container">
            <div v-for="set in sets" :key="set.id" class="card-wrapper">
              <SetBox :set="set" />
            </div>
          </div>

          <!-- Pagination for Sets -->
          <div class="pagination" v-if="setsTotalPages > 1">
            <button
                class="pagination-button"
                :disabled="setsPage === 0"
                @click="changeSetsPage(setsPage - 1)"
            >
              <
            </button>
            <span class="pagination-info">
              Page {{ setsPage + 1 }} of {{ setsTotalPages }}
            </span>
            <button
                class="pagination-button"
                :disabled="setsPage >= setsTotalPages - 1"
                @click="changeSetsPage(setsPage + 1)"
            >
              >
            </button>
          </div>
        </div>

        <!-- Tab Classes -->
        <div class="class-list" v-if="activeTab === 'Classes'">
          <div v-for="classItem in classes" :key="classItem.classId" class="class-card" @click="showClassModal(classItem)">
            <img src="../assets/class.svg" alt="Icon" class="class-icon" />
            <div class="class-info">
              <h3>{{ classItem.className }}</h3>
              <div class="class-detail">
                <p>{{ classItem.numberOfSets }} {{ classItem.numberOfSets <= 1 ? 'set' : 'sets' }} |</p>
                <p>{{ classItem.numberOfMembers }} {{ classItem.numberOfMembers <= 1 ? 'member' : 'members' }}</p>
              </div>
            </div>
          </div>

          <!-- Pagination for Classes -->
          <div class="pagination" v-if="classesTotalPages > 1">
            <button
                class="pagination-button"
                :disabled="classesPage === 0"
                @click="changeClassesPage(classesPage - 1)"
            >
              <
            </button>
            <span class="pagination-info">
              Page {{ classesPage + 1 }} of {{ classesTotalPages }}
            </span>
            <button
                class="pagination-button"
                :disabled="classesPage >= classesTotalPages - 1"
                @click="changeClassesPage(classesPage + 1)"
            >
              >
            </button>
          </div>
        </div>

        <!-- Tab User Management -->
        <div v-if="activeTab === 'User Management'">
          <UserManagement />
        </div>
      </div>

      <ClassModal v-if="classModalMode" :Overlay_background="classModalMode" @close="classModalMode = false" />
      <ClassTable v-if="classTableMode" :isEditMode="true" @close="classTableMode = false" />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: #f4f6f9;
  font-family: 'Arial', sans-serif;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 40px;
  height: 40px;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-menu button {
  background: none;
  border: none;
  color: white;
  padding: 10px;
  text-align: left;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.nav-menu button:hover,
.nav-menu button.active {
  background-color: #34495e;
  border-radius: 5px;
}

.user-info {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-info span {
  font-size: 14px;
}


.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-input {
  border: none;
  outline: none;
  padding: 8px 12px;
  width: 250px;
  font-size: 14px;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  width: 18px;
  height: 18px;
}

.content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sets-list, .class-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sets-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card-wrapper {
  min-width: 250px;
}

.class-card {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.class-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.class-icon {
  font-size: 30px;
  margin-right: 15px;
  color: #2c3e50;
}

.class-info h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.class-detail {
  display: flex;
  gap: 5px;
}

.class-info p {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
  transition: transform 0.2s;
}

.class-info p:hover {
  transform: scale(1.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination-button {
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: #34495e;
}

.pagination-info {
  font-size: 14px;
  color: #7f8c8d;
}
</style>