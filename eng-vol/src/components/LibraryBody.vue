<script setup>
import ClassModal from '@/components/ClassModal.vue';
import JoinBox from './JoinBox.vue';
import SetBox from "./SetBox.vue";
import ClassTable from './ClassTable.vue';
import { checkClassBelonging } from "@/apis/classApi.js";
import { ref, computed } from "vue";

// Trạng thái hiển thị modal chi tiết lớp học
const classModalMode = ref(false);
// Trạng thái hiển thị bảng danh sách lớp học
const classTableMode = ref(false);
// Trạng thái hiển thị modal tham gia lớp học
const joinMode = ref(false);
// Tab hiện tại (mặc định là "Flashcard sets", có thể chuyển sang "Classes")
const activeTab = ref("Flashcard sets");
// Lưu thông tin lớp học được chọn
const selectedClassItem = ref("");
// Kiểm tra xem người dùng có phải thành viên của lớp học không
const isMember = ref(false);

// Định nghĩa props nhận từ component cha
const props = defineProps({
  sets: Array, // Danh sách các bộ flashcard
  classes: Array, // Danh sách các lớp học
  setsPage: Number, // Trang hiện tại của bộ flashcard
  setsTotalPages: Number, // Tổng số trang của bộ flashcard
  setsTotalElements: Number, // Tổng số bộ flashcard
  classesPage: Number, // Trang hiện tại của lớp học
  classesTotalPages: Number, // Tổng số trang của lớp học
  classesTotalElements: Number // Tổng số lớp học
});

// Định nghĩa các sự kiện emit gửi lên component cha
const emit = defineEmits([
  'close', // Đóng overlay
  'change-sets-page', // Thay đổi trang của bộ flashcard
  'change-classes-page', // Thay đổi trang của lớp học
  'reload' // Tải lại dữ liệu
]);

// Hàm chọn lớp học và kiểm tra tư cách thành viên
const selectClass = async (classItem) => {
  selectedClassItem.value = classItem; // Lưu lớp học được chọn
  localStorage.setItem('classId', selectedClassItem.value.classId); // Lưu ID lớp vào localStorage
  localStorage.setItem('className', selectedClassItem.value.className); // Lưu tên lớp vào localStorage
  try {
    // Kiểm tra xem người dùng có phải thành viên của lớp không
    isMember.value = await checkClassBelonging(selectedClassItem.value.classId, localStorage.getItem('token'));
    joinMode.value = !isMember.value; // Nếu không phải thành viên, hiển thị modal tham gia
  } catch (err) {
    // Xử lý lỗi khi gọi API
    console.error(err);
    alert(err);
  }
};

// Hàm hiển thị modal chi tiết lớp học
const showClassModal = async (classItem) => {
  await selectClass(classItem); // Gọi trước để cập nhật isMember
  if (isMember.value) {
    classModalMode.value = true; // Hiển thị modal nếu là thành viên
  }
  // joinMode đã được xử lý trong selectClass()
};

// Hàm tải lại dữ liệu và cập nhật lớp học được chọn
const reload = async () => {
  await emit('reload'); // Phát sự kiện reload để component cha tải lại dữ liệu
  const classId = localStorage.getItem('classId'); // Lấy ID lớp từ localStorage
  for (let i = 0; i < props.classes.length; i++) {
    if (props.classes[i].classId === classId) {
      selectedClassItem.value = props.classes[i]; // Cập nhật lớp được chọn
      localStorage.setItem('className', selectedClassItem.value.className); // Cập nhật tên lớp
      break;
    }
  }
};

// Hàm đóng overlay
function closeOverlay() {
  emit('close'); // Phát sự kiện đóng overlay
  isMember.value = false; // Đặt lại trạng thái thành viên
}

// Hàm chuyển đổi tab (Flashcard sets <-> Classes)
const switchTab = () => {
  activeTab.value = activeTab.value === "Flashcard sets" ? "Classes" : "Flashcard sets";
};

// Hàm xử lý thay đổi trang của bộ flashcard
const handleSetsPageChange = (newPage) => {
  emit('change-sets-page', newPage); // Phát sự kiện thay đổi trang
};

// Hàm xử lý thay đổi trang của lớp học
const handleClassesPageChange = (newPage) => {
  emit('change-classes-page', newPage); // Phát sự kiện thay đổi trang
};

// Tạo mảng số trang cho bộ flashcard
const setSetsPageNumbers = computed(() => {
  if (!props.setsTotalPages) return []; // Nếu không có trang, trả về rỗng
  const totalPages = props.setsTotalPages; // Tổng số trang
  const currentPage = props.setsPage; // Trang hiện tại
  const pageNumbers = [];

  // Tạo danh sách số trang (hiển thị tối đa 5 trang gần trang hiện tại)
  const start = Math.max(0, currentPage - 2); // Bắt đầu từ trang hiện tại - 2
  const end = Math.min(totalPages, currentPage + 3); // Kết thúc ở trang hiện tại + 2

  for (let i = start; i < end; i++) {
    pageNumbers.push(i); // Thêm số trang vào mảng
  }

  return pageNumbers;
});

// Tạo mảng số trang cho lớp học
const setClassPageNumbers = computed(() => {
  if (!props.classesTotalPages) return []; // Nếu không có trang, trả về rỗng
  const totalPages = props.classesTotalPages; // Tổng số trang
  const currentPage = props.classesPage; // Trang hiện tại
  const pageNumbers = [];

  // Tạo danh sách số trang (hiển thị tối đa 5 trang gần trang hiện tại)
  const start = Math.max(0, currentPage - 2); // Bắt đầu từ trang hiện tại - 2
  const end = Math.min(totalPages, currentPage + 3); // Kết thúc ở trang hiện tại + 2

  for (let i = start; i < end; i++) {
    pageNumbers.push(i); // Thêm số trang vào mảng
  }

  return pageNumbers;
});
</script>

<template>
  <main>
    <div class="tabs">
      <button
          :class="{ active: activeTab == 'Flashcard sets' }"
          @click="switchTab"
      >
        Flashcard sets
      </button>
      <button
          :class="{ active: activeTab == 'Classes' }"
          @click="switchTab"
      >
        Classes
      </button>
    </div>
    <div class="line"></div>

    <!-- Sets List -->
    <div v-if="activeTab == 'Flashcard sets'" class="sets-list">
      <div class="sets-container">
        <div v-for="set in sets" :key="set.id" class="card-wrapper">
          <SetBox :set="set"
            @reload = "reload"
          />
        </div>
      </div>

      <!-- Pagination for Sets -->
      <div v-if="setsTotalPages > 1" class="pagination">
        <button
            class="pagination-btn"
            @click="handleSetsPageChange(setsPage - 1)"
            :disabled="setsPage === 0"
        >
          Prev
        </button>

        <div class="page-numbers">
          <button
              v-for="pageNum in setSetsPageNumbers"
              :key="pageNum"
              class="page-number-btn"
              :class="{ active: pageNum === setsPage }"
              @click="handleSetsPageChange(pageNum)"
          >
            {{ pageNum + 1 }}
          </button>
        </div>

        <button
            class="pagination-btn"
            @click="handleSetsPageChange(setsPage + 1)"
            :disabled="setsPage === setsTotalPages - 1"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Classes List -->
    <div v-if="activeTab == 'Classes'" class="class-list">
      <div
          v-for="classItem in classes"
          :key="classItem.classId"
          class="class-card"
          @click="showClassModal(classItem)"
      >
        <img src="../assets/class.svg" alt="Icon" class="class-icon">
        <div class="class-info">
          <h3>{{ classItem.className }}</h3>
          <div class="class-detail">
            <p>{{ classItem.numberOfSets }} {{ classItem.numberOfSets <= 1 ? 'set' : 'sets' }} |</p>
            <p>{{ classItem.numberOfMembers }} {{ classItem.numberOfMembers <= 1 ? 'member' : 'members' }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination for Classes -->
      <div v-if="classesTotalPages > 1" class="pagination">
        <button
            class="pagination-btn"
            @click="handleClassesPageChange(classesPage - 1)"
            :disabled="classesPage === 0"
        >
          Prev
        </button>

        <div class="page-numbers">
          <button
              v-for="pageNum in setClassPageNumbers"
              :key="pageNum"
              class="page-number-btn"
              :class="{ active: pageNum === classesPage }"
              @click="handleClassesPageChange(pageNum)"
          >
            {{ pageNum + 1 }}
          </button>
        </div>

        <button
            class="pagination-btn"
            @click="handleClassesPageChange(classesPage + 1)"
            :disabled="classesPage === classesTotalPages - 1"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Modals and Overlays -->
    <ClassModal
        v-if="classModalMode && isMember"
        :Overlay_background="classModalMode"
        @close="classModalMode = false"
        @reload="reload"
    />
    <ClassTable
        v-if="classTableMode && isMember"
        :isEditMode="true"
        @close="classTableMode = false"
    />
    <JoinBox
        v-if="!isMember && joinMode"
        :classItem="selectedClassItem"
        :Overlay_background="!isMember && joinMode"
        @close="joinMode = false"
    />
  </main>
</template>

<style scoped>
main {
  position: absolute;
  top: 40px;
  left: 0px;
  width: 100%;
}

.tabs {
  display: flex;
  gap: 20px;
}

.tabs button {
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.tabs button.active {
  border-bottom: 2px solid black;
}

.line {
  display: flex;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 1px;
  background-color: rgba(14, 14, 14, 0.1);
  margin-bottom: 30px;
}

.class-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.class-card {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.class-card:hover {
  transform: scale(1.05);
}

.class-icon {
  font-size: 30px;
  margin-right: 20px;
}

.class-info h3 {
  margin: 0;
  font-weight: bold;
  font-size: 18px;
}

.class-list .class-detail {
  display: flex;
}

.class-info p {
  margin: 0;
  font-size: 14px;
  color: gray;
  margin-left: 5px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.class-info p:hover {
  transform: scale(1.1);
}

.sets-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card-wrapper {
  min-width: 250px;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  user-select: none;
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

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number-btn {
  min-width: 40px;
}

.page-number-btn.active {
  background-color: black;
  color: white;
}
</style>