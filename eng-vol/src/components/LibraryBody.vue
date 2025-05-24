<script setup>
import ClassModal from '@/components/ClassModal.vue'
import JoinBox from './JoinBox.vue';
import SetBox from "./SetBox.vue"
import ClassTable from './ClassTable.vue';
import { checkClassBelonging } from "@/apis/classApi.js";
import { ref, computed } from "vue";

const classModalMode = ref(false);
const classTableMode = ref(false);
const joinMode = ref(false);
const activeTab = ref("Flashcard sets");
const selectedClassItem = ref("");
const isMember = ref(false);

const props = defineProps({
  sets: Array,
  classes: Array,
  setsPage: Number,
  setsTotalPages: Number,
  setsTotalElements: Number,
  classesPage: Number,
  classesTotalPages: Number,
  classesTotalElements: Number
});


const emit = defineEmits([
  'close',
  'change-sets-page',
  'change-classes-page',
  'reload'
]);

const selectClass = async (classItem) => {
  selectedClassItem.value = classItem;
  localStorage.setItem('classId', selectedClassItem.value.classId);
  localStorage.setItem('className', selectedClassItem.value.className);
  try {
    isMember.value = await checkClassBelonging(selectedClassItem.value.classId, localStorage.getItem('token'));
    joinMode.value = !isMember.value;
  } catch(err) {
    console.error(err);
    alert(err)
  }
}

const showClassModal = (classItem) => {
  if(isMember) {
    classModalMode.value = true;
    selectClass(classItem);
  }
}

const reload = async () => {
  await emit('reload');
  const classId = localStorage.getItem('classId')
  for (let i = 0; i < props.classes.length; i++) {
    if (props.classes[i].classId === classId) {
      selectedClassItem.value = props.classes[i];
      localStorage.setItem('className', selectedClassItem.value.className);
      break;
    }
  }
}

function closeOverlay() {
  emit('close');
  isMember.value = false;
}

const switchTab = () => {
  activeTab.value = activeTab.value === "Flashcard sets" ? "Classes" : "Flashcard sets";
}

// Hàm xử lý phân trang
const handleSetsPageChange = (newPage) => {
  emit('change-sets-page', newPage);
}

const handleClassesPageChange = (newPage) => {
  emit('change-classes-page', newPage);
}

// Tạo mảng các trang để hiển thị
const setSetsPageNumbers = computed(() => {
  if (!props.setsTotalPages) return [];
  const totalPages = props.setsTotalPages;
  const currentPage = props.setsPage;
  const pageNumbers = [];

  // Logic tạo các nút trang
  const start = Math.max(0, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 3);

  for (let i = start; i < end; i++) {
    pageNumbers.push(i);
  }

  return pageNumbers;
});

const setClassPageNumbers = computed(() => {
  if (!props.classesTotalPages) return [];
  const totalPages = props.classesTotalPages;
  const currentPage = props.classesPage;
  const pageNumbers = [];

  // Logic tạo các nút trang
  const start = Math.max(0, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 3);

  for (let i = start; i < end; i++) {
    pageNumbers.push(i);
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