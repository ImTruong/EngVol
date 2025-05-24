<script setup>
  import {onMounted, defineProps, defineEmits, ref, watch, onUnmounted} from 'vue';
  import SetBox from './SetBox.vue';
  import OverlayBackground from './OverlayBackground.vue';
  import ClassTable from './ClassTable.vue';
  import SetTable from '../components/SetTable.vue';
  import { leaveClass } from '@/apis/classApi';
  import {getSetByClassId, getSetsByName} from '@/apis/setApi';
  import { deleteClass } from '@/apis/classApi';

  const classTable = ref(false);
  const sets = ref([]);
  const filteredSets = ref([]);
  const visible = ref(true);
  const isEditMode = ref(false);
  const existingClass = ref({});
  let className = localStorage.getItem('className');
  const classId = localStorage.getItem('classId');
  const setTable = ref(false);
  const existingSet = ref(null);
  const { Overlay_background } = defineProps(['Overlay_background']);
  const emit = defineEmits(['close', 'reload']);
  const inClass = ref(true);
  const icon = ref(false);
  const search = ref("");
  const page = ref(0);
  const size = ref(6); // Số set hiển thị trên một trang
  const totalPages = ref(1);
  const totalSets = ref(0);
  const loading = ref(false);

  function closeOverlay() {
    emit('close');
  }

  const showClassTable = (classItem) => {
    classTable.value = true;
    visible.value = false;
    icon.value = false;
    existingClass.value = classItem;
  };

  const closeClassTable = () => {
    classTable.value = false;
    visible.value = true;
  };

  watch(search, async () => {
    page.value = 0; // Reset về trang đầu tiên khi tìm kiếm
    await fetchSets();
  });

  const handleLeaveClass = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await leaveClass(classId, token);
      alert(response);
      emit("close");
      emit('reload');
    } catch (error) {
      console.log(error)
      alert(error);
    }
  };

  const handleDeleteClass = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await deleteClass(token, classId);
      alert(response);
      emit("close");
      emit('reload')
    } catch (error) {
      console.log(error)
      alert(error);
    }
  };

  const showSetTable = (editMode = false) => {
    isEditMode.value = editMode;
    setTable.value = true;
    icon.value = false;
    existingClass.value = classItem;
  };

  const fetchSets = async () => {
    const token = localStorage.getItem('token');
    loading.value = true;
    try {
      let response;
      if (search.value) {
        response = await getSetsByName(search.value.toLowerCase(), token, page.value, size.value, classId);
      } else {
        response = await getSetByClassId(classId, token, page.value, size.value);
      }

      // Giả sử response là Page<SetResponse> có cấu trúc như sau:
      // { content: [...], totalElements, totalPages, number, ... }
      if (response && typeof response === 'object') {
        // Lấy nội dung sets từ response
        sets.value = response.content || [];

        // Cập nhật thông tin phân trang
        totalSets.value = response.totalElements || 0;
        totalPages.value = response.totalPages || 1;

        // Đảm bảo page hiện tại khớp với response
        // response.number là page hiện tại (zero-based)
        if (response.number !== undefined) {
          page.value = response.number;
        }
      } else {
        console.error("Unexpected API response format", response);
        sets.value = Array.isArray(response) ? response : [];
      }
    } catch (error) {
      console.error("Error fetching sets:", error);
      alert("Failed to load sets");
    } finally {
      loading.value = false;
    }
  };

  const goToNextPage = () => {
    if (page.value < totalPages.value - 1) {
      page.value++;
      fetchSets();
    }
  };

  const goToPrevPage = () => {
    if (page.value > 0) {
      page.value--;
      fetchSets();
    }
  };

  const handleReload = async () => {
    await fetchSets();
    await emit('reload')
    className = localStorage.getItem('className');
  };

  onMounted(() => {
    fetchSets();
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