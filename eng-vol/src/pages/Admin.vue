<script setup>
import ClassModal from '@/components/ClassModal.vue'
import SetBox from "@/components/SetBox.vue"
import ClassTable from '@/components/ClassTable.vue';
import UserManagement from '@/components/UserManagement.vue';
import { getAllClasses }  from "@/apis/classApi.js";
import { getAllSets }  from "@/apis/setApi.js";
import { ref } from "vue";
import { onMounted, onUnmounted } from "vue";

const classModalMode = ref(false);
const classTableMode = ref(false);
const activeTab = ref("Flashcard sets");
const classes = ref(null);
const sets = ref(null);
const search = ref("");

// Sets pagination
const setsPage = ref(0);
const setsSize = ref(10);
const setsTotalPages = ref(0);
const setsTotalElements = ref(0);

// Classes pagination
const classesPage = ref(0);
const classesSize = ref(10);
const classesTotalPages = ref(0);
const classesTotalElements = ref(0);

let intervalId = null;

// Updated fetchData to handle pagination
const fetchData = async (token) => {
  try {
    // Fetch sets with pagination
    if (activeTab.value === "Flashcard sets" || activeTab.value === "Classes") {
      const setsData = await getAllSets(token, search.value, setsPage.value, setsSize.value);
      sets.value = setsData.content;
      setsTotalPages.value = setsData.totalPages;
      setsTotalElements.value = setsData.totalElements;
    }

    // Fetch classes with pagination
    if (activeTab.value === "Flashcard sets" || activeTab.value === "Classes") {
      const classesData = await getAllClasses(token, search.value, classesPage.value, classesSize.value);
      classes.value = classesData.content;
      classesTotalPages.value = classesData.totalPages;
      classesTotalElements.value = classesData.totalElements;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Pagination handlers
const changeSetsPage = (newPage) => {
  setsPage.value = newPage;
  const token = localStorage.getItem("token");
  fetchData(token);
};

const changeClassesPage = (newPage) => {
  classesPage.value = newPage;
  const token = localStorage.getItem("token");
  fetchData(token);
};

onMounted(() => {
  const token = localStorage.getItem("token");
  fetchData(token); // fetch ban đầu

  intervalId = setInterval(() => {
    fetchData(token); // truyền đúng token vào
  }, 3000);
});

onUnmounted(() => {
  clearInterval(intervalId); // dọn dẹp interval
});

const showClassModal = (classItem) => {
  classModalMode.value = true;
  localStorage.setItem('classId', classItem.classId);
  localStorage.setItem('className', classItem.className);
}

function closeOverlay() {
  emit('close');
  isMember.value = false;
}

const switchTab = (tabName) => {
  activeTab.value = tabName;
  // Nếu chuyển tab, xóa giá trị tìm kiếm và làm mới dữ liệu
  if (tabName === "User Management") {
    search.value = "";
  } else {
    const token = localStorage.getItem("token");
    // Reset to page 0 when switching tabs
    setsPage.value = 0;
    classesPage.value = 0;
    fetchData(token);
  }
}

// Hàm tìm kiếm mới
const handleSearch = () => {
  const token = localStorage.getItem("token");
  // Reset về trang đầu tiên khi tìm kiếm
  setsPage.value = 0;
  classesPage.value = 0;
  fetchData(token);
}

// Hàm dùng khi nhấn Enter trong input tìm kiếm
const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

// Hàm kiểm tra xem có hiển thị thanh tìm kiếm hay không
const showSearchBar = () => {
  return activeTab.value !== "User Management";
}
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