<script setup>
import { onMounted, defineProps, defineEmits, ref, watch, onUnmounted } from 'vue';
import SetBox from './SetBox.vue';
import OverlayBackground from './OverlayBackground.vue';
import ClassTable from './ClassTable.vue';
import SetTable from '../components/SetTable.vue';
import { leaveClass, deleteClass } from '@/apis/classApi';
import { getSetByClassId, getSetsByName } from '@/apis/setApi';

// Khởi tạo các biến reactive
const classTable = ref(false); // Trạng thái hiển thị bảng lớp học
const sets = ref([]); // Danh sách các bộ flashcard
const filteredSets = ref([]); // Danh sách bộ flashcard đã lọc (chưa sử dụng)
const visible = ref(true); // Trạng thái hiển thị overlay chính
const isEditMode = ref(false); // Chế độ chỉnh sửa bộ flashcard
const existingClass = ref({}); // Thông tin lớp học hiện tại
let className = localStorage.getItem('className'); // Tên lớp từ localStorage
const classId = localStorage.getItem('classId'); // ID lớp từ localStorage
const setTable = ref(false); // Trạng thái hiển thị bảng bộ flashcard
const existingSet = ref(null); // Bộ flashcard đang chỉnh sửa (chưa sử dụng)
const { Overlay_background } = defineProps(['Overlay_background']); // Props nhận Overlay_background
const emit = defineEmits(['close', 'reload']); // Sự kiện emit: đóng overlay, tải lại
const inClass = ref(true); // Kiểm tra người dùng có trong lớp không
const icon = ref(false); // Trạng thái hiển thị icon (chưa rõ mục đích)
const search = ref(""); // Từ khóa tìm kiếm bộ flashcard
const page = ref(0); // Trang hiện tại của danh sách bộ flashcard
const size = ref(6); // Số bộ flashcard mỗi trang
const totalPages = ref(1); // Tổng số trang
const totalSets = ref(0); // Tổng số bộ flashcard
const loading = ref(false); // Trạng thái đang tải dữ liệu

// Hàm đóng overlay
function closeOverlay() {
  emit('close'); // Phát sự kiện đóng overlay
}

// Hàm hiển thị bảng lớp học
const showClassTable = (classItem) => {
  classTable.value = true; // Hiện bảng lớp học
  visible.value = false; // Ẩn overlay chính
  icon.value = false; // Ẩn icon
  existingClass.value = classItem; // Lưu thông tin lớp được chọn
};

// Hàm đóng bảng lớp học
const closeClassTable = () => {
  classTable.value = false; // Ẩn bảng lớp học
  visible.value = true; // Hiện lại overlay chính
};

// Theo dõi thay đổi từ khóa tìm kiếm
watch(search, async () => {
  page.value = 0; // Reset về trang đầu khi tìm kiếm
  await fetchSets(); // Tải lại danh sách bộ flashcard
});

// Hàm rời khỏi lớp học
const handleLeaveClass = async () => {
  const token = localStorage.getItem('token'); // Lấy token xác thực
  try {
    const response = await leaveClass(classId, token); // Gọi API rời lớp
    alert(response); // Hiển thị thông báo từ API
    emit("close"); // Đóng overlay
    emit('reload'); // Phát sự kiện tải lại
  } catch (error) {
    console.log(error);
    alert(error); // Hiển thị lỗi
  }
};

// Hàm xóa lớp học
const handleDeleteClass = async () => {
  const token = localStorage.getItem('token'); // Lấy token xác thực
  try {
    const response = await deleteClass(token, classId); // Gọi API xóa lớp
    alert(response); // Hiển thị thông báo từ API
    emit("close"); // Đóng overlay
    emit('reload'); // Phát sự kiện tải lại
  } catch (error) {
    console.log(error);
    alert(error); // Hiển thị lỗi
  }
};

// Hàm hiển thị bảng bộ flashcard
const showSetTable = (editMode = false) => {
  isEditMode.value = editMode; // Cập nhật chế độ chỉnh sửa
  setTable.value = true; // Hiện bảng bộ flashcard
  icon.value = false; // Ẩn icon
  // Lưu ý: existingClass.value = classItem gây lỗi vì classItem không được định nghĩa
};

// Hàm lấy danh sách bộ flashcard
const fetchSets = async () => {
  const token = localStorage.getItem('token'); // Lấy token xác thực
  loading.value = true; // Bắt đầu tải
  try {
    let response;
    if (search.value) {
      // Tìm kiếm bộ flashcard theo tên
      response = await getSetsByName(search.value.toLowerCase(), token, page.value, size.value, classId);
    } else {
      // Lấy tất cả bộ flashcard của lớp
      response = await getSetByClassId(classId, token, page.value, size.value);
    }

    // Giả sử response có cấu trúc Page<SetResponse> { content, totalElements, totalPages, number }
    if (response && typeof response === 'object') {
      sets.value = response.content || []; // Gán danh sách bộ flashcard
      totalSets.value = response.totalElements || 0; // Cập nhật tổng số bộ
      totalPages.value = response.totalPages || 1; // Cập nhật tổng số trang
      if (response.number !== undefined) {
        page.value = response.number; // Đồng bộ trang hiện tại
      }
    } else {
      console.error("Định dạng phản hồi API không đúng", response);
      sets.value = Array.isArray(response) ? response : []; // Xử lý trường hợp bất ngờ
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bộ flashcard:", error);
    alert("Lỗi khi tải danh sách bộ flashcard");
  } finally {
    loading.value = false; // Kết thúc tải
  }
};

// Hàm chuyển sang trang tiếp theo
const goToNextPage = () => {
  if (page.value < totalPages.value - 1) {
    page.value++; // Tăng trang
    fetchSets(); // Tải lại danh sách
  }
};

// Hàm chuyển về trang trước
const goToPrevPage = () => {
  if (page.value > 0) {
    page.value--; // Giảm trang
    fetchSets(); // Tải lại danh sách
  }
};

// Hàm tải lại dữ liệu
const handleReload = async () => {
  await fetchSets(); // Tải lại danh sách bộ flashcard
  await emit('reload'); // Phát sự kiện reload
  className = localStorage.getItem('className'); // Cập nhật tên lớp
};

// Khi component được mount
onMounted(() => {
  fetchSets(); // Tải danh sách bộ flashcard ban đầu
});
</script>

<template>
  <OverlayBackground
      :isVisible="Overlay_background"
      @clickOverlay="closeOverlay" />
  <div class="classbox-container" v-if="visible">
    <div class="search-container">
      <input v-model.trim="search" type="text" placeholder="Search ..." class="search-bar"/>
      <img src="../assets/search.svg" alt="Icon" class="search-icon">
    </div>
    <div v-if="icon" class="icon">
      <img src="../assets/add_set.svg" alt="Icon" class="add-set-icon" @click="showSetTable(false)">
      <img src="../assets/add_member.svg" alt="Icon" class="add-member-icon" @click="showClassTable">
      <img src="../assets/leave-group.svg" alt="Icon" class="leave-group-icon" @click="handleLeaveClass">
      <img src="../assets/icons/delete.png"  alt="Icon" class="delete-group-icon" @click="handleDeleteClass">
    </div>
    <h2 @click="icon = !icon">
      {{ className }}
      <img src="../assets/dropdown.svg" alt="Icon" class="dropdown-icon" >
    </h2>
    <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
    <div class="line"></div>

    <div class="card-container">
      <div v-if="loading" class="loading-indicator">
        Loading...
      </div>
      <template v-else>
        <SetBox
            v-for="set in sets"
            :key="set.id"
            :set="set"
            :classId="classId"
            @reload="handleReload"
        />
        <div v-if="sets.length === 0" class="no-results">
          No sets found
        </div>
      </template>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <button
          @click="goToPrevPage"
          :disabled="page === 0"
          class="pagination-button"
      >
        &lt; Previous
      </button>
      <span class="pagination-info">
        Page {{ page + 1 }} of {{ totalPages || 1 }}
        ({{ totalSets }} sets)
      </span>
      <button
          @click="goToNextPage"
          :disabled="page >= totalPages - 1"
          class="pagination-button"
      >
        Next &gt;
      </button>
    </div>

    <SetTable
        v-if="setTable"
        :classId="classId"
        :className="className"
        :inClass="inClass = true"
        :isEditMode="isEditMode"
        :existingSet="existingSet"
        @close="setTable = false"
        @reload="handleReload"
    />
  </div>

  <ClassTable
      v-if="classTable"
      :isEditMode=true
      @close="closeClassTable"
      @reload="handleReload"
  />
</template>

<style scoped>
.classbox-container {
  position: fixed;
  top: 15vh;
  left: 20vw;
  height: 75vh;
  width: 60vw;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: white;
  overflow: hidden;
  z-index: 11;
}

.dropdown-icon {
  width: 30px;
}

.dropdown-icon:hover {
  transform: scale(1.1);
}

.classbox-container .close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.classbox-container h2 {
  position: absolute;
  top: 25px;
  left: 10%;
  cursor: pointer;
  display: flex;
  align-content: center;
}

.classbox-container h2:hover {
  transform: scale(1.1);
}

.search-container {
  position: absolute;
  text-align: center;
  justify-content: center;
  width: 30%;
  top: 25px;
  left: 60%;
}

.search-container .search-icon {
  position: absolute;
  left: 10px;
  top: 7px;
}

.search-container .search-bar {
  width: 100%;
  padding: 8px 16px 8px 30px;
  border-radius: 5px;
  display: inline-block;
  cursor: pointer;
}

.icon {
  position: absolute;
  top: 15%;
  left: 15%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px  5px  5px 5px;
  height: 60px;
  background-color: rgb(251, 251, 251);
  z-index: 12;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
}

.add-set-icon {
  cursor: pointer;
  height: 40px;
}

.add-set-icon:hover {
  transform: scale(1.05);
}

.add-member-icon {
  cursor: pointer;
  height: 40px;
}

.add-member-icon:hover {
  transform: scale(1.05);
}

.delete-group-icon{
  cursor: pointer;
  height: 30px;
  margin-left: 10px;
}

.delete-group-icon:hover {
  transform: scale(1.05);
}

.add-member-icon:hover {
  transform: scale(1.05);
}

.leave-group-icon {
  cursor: pointer;
  height: 35px;
}

.leave-group-icon:hover {
  transform: scale(1.05);
}

.classbox-container .line {
  position: absolute;
  top: 15%;
  width: 80%;
  height: 1px;
  left: 10%;
  z-index: 10;
  background-color: rgba(71, 59, 59, 0.5);
}

.card-container {
  position: absolute;
  width: 100%;
  height: 70%; /* Điều chỉnh để dành chỗ cho phân trang */
  top: 17%;
  padding: 10px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  overflow: auto;
}

/* Pagination styles */
.pagination-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.pagination-button {
  padding: 8px 15px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e1e1e1;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
  font-size: 16px;
  color: #666;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
  font-size: 16px;
  color: #666;
}
</style>