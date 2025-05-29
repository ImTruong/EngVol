<script setup>
import { ref, defineProps } from "vue"; // Import các hàm reactive và props từ Vue
import { useRouter } from "vue-router"; // Import router để điều hướng giữa các trang
import SetTable from "../components/SetTable.vue"; // Import component SetTable để hiển thị bảng thông tin bộ flashcard
import { useStore } from 'vuex'; // Import Vuex để quản lý trạng thái toàn cục
import { deleteSet } from "@/apis/setApi"; // Import API để xóa bộ flashcard
import { defineEmits } from 'vue'; // Import hàm để định nghĩa các sự kiện phát ra từ component

// Định nghĩa sự kiện phát ra từ component
const emit = defineEmits(['reload']);

// Biến reactive để quản lý trạng thái
const hover = ref(false); // Trạng thái hover của thẻ
const router = useRouter(); // Khởi tạo router để điều hướng
const props = defineProps(['set', 'classId']); // Định nghĩa các props được truyền vào component
const setTable = ref(false); // Trạng thái hiển thị bảng thông tin bộ flashcard
const existingSet = ref({}); // Bộ flashcard hiện tại
const isEditMode = ref(false); // Trạng thái chỉnh sửa bộ flashcard
const token = localStorage.getItem("token"); // Lấy token từ localStorage

const store = useStore(); // Khởi tạo store để truy cập trạng thái toàn cục

// Hàm chỉnh sửa bộ flashcard
const editSet = () => {
  showSetTable(true, props.set); // Hiển thị bảng thông tin bộ flashcard với chế độ chỉnh sửa
};

// Hàm reload dữ liệu
const reload = () => {
  emit("reload"); // Phát sự kiện reload
};

// Hàm cập nhật bộ flashcard hiện tại trong Vuex
const updateCurrentSet = (set) => {
  store.dispatch('setModule/setCurrentSet', set); // Dispatch hành động để cập nhật bộ flashcard
};

// Hàm bắt đầu trò chơi với bộ flashcard
const gameSet = () => {
  if (!props.set.wordResponses || props.set.wordResponses.length === 0) {
    alert("No words in this set!"); // Hiển thị thông báo nếu bộ flashcard không có từ
    return;
  }
  updateCurrentSet(props.set); // Cập nhật bộ flashcard hiện tại
  router.push(`/fillgame/${props.set.id}`); // Điều hướng đến trang trò chơi
};

// Hàm bắt đầu học với bộ flashcard
const studySet = () => {
  if (!props.set.wordResponses || props.set.wordResponses.length === 0) {
    alert("Please add words before studying!"); // Hiển thị thông báo nếu bộ flashcard không có từ
    return;
  }
  updateCurrentSet(props.set); // Cập nhật bộ flashcard hiện tại
  router.push(`/flashcard/${props.set.id}`); // Điều hướng đến trang học
};

// Hàm hiển thị bảng thông tin bộ flashcard
const showSetTable = (editMode, existingSetData) => {
  setTable.value = true; // Bật trạng thái hiển thị bảng
  isEditMode.value = editMode; // Cập nhật trạng thái chỉnh sửa
  existingSet.value = existingSetData; // Cập nhật dữ liệu bộ flashcard hiện tại
};

// Hàm đóng bảng thông tin bộ flashcard
const closeSetTable = () => {
  setTable.value = false; // Tắt trạng thái hiển thị bảng
};

// Hàm xử lý cập nhật danh sách từ trong bộ flashcard
const handleUpdate = (updatedRows) => {
  existingSet.value.wordListResponses = updatedRows; // Cập nhật danh sách từ
  emit("reload"); // Phát sự kiện reload
};

// Hàm xóa bộ flashcard
const handleDeleteSet = async () => {
  try {
    await deleteSet(props.set.id, token); // Gọi API để xóa bộ flashcard
    alert("Set deleted successfully!"); // Hiển thị thông báo thành công
    emit("reload"); // Phát sự kiện reload
  } catch (error) {
    alert(error); // Hiển thị lỗi nếu có
  }
};
</script>

<template>
    <div class="card" @mouseover="hover = true" @mouseleave="hover = false" >
      <div class="card-text">
        <h2>{{ props.set.name }}</h2>
        <p class="number-terms">{{ props.set.numberOfWords }} {{ props.set.numberOfWords <= 1 ? 'term' : 'terms' }} </p>
        <p>{{ props.set.userDetailResponse.fullName}}</p>
      </div>
      <div class="set-option">
        <div class="icon-container">
            <img src="../assets/study.svg" alt="Study" @click.stop="studySet" />
        </div>
        <div class="icon-container" @click.stop="gameSet" >
          <img src="../assets/game.svg" alt="Game">
        </div>
        <div class="icon-container" @click.stop="editSet" >
          <img src="../assets/edit.svg" alt="Edit">
        </div>
        <div class="icon-container" @click.stop="handleDeleteSet" >
          <img src="../assets/delete.svg" alt="Delete">
        </div>
      </div>
    </div>
    <SetTable 
        v-if="setTable" 
        :isEditMode="isEditMode" 
        :existingSet="existingSet"
        :classId="props.classId"
        @close="closeSetTable" 
        @update="handleUpdate"
        @reload="reload"
      />
</template>
  

<style scoped>
  .card {
    margin-left: 10px;
    width: 28%;
    min-width: 280px;
    height: 160px;
    overflow: hidden;
    border-radius: 4%;
    box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 35px;
    cursor: pointer;
    position: relative;
  }
  
  .card:hover {
    transform: scale(1.05);
    background-color:#e6e6e6;
  }

  .card-text {
      position: absolute;
      padding: 10px;
  }

  .card-text h2 {
      font-weight: 500;

  }

  .card-text p {
      color: #777;
      margin-top: 5px;
      margin-bottom: 40px;
  }

  .number-terms{
      background-color: rgba(105, 105, 148, 0.2);
      border-radius: 5px;
      width: 60px;
      height: 25px;
      text-align: center;
  }

  .set-option {
    /* position: absolute; */
    display: flex;
    gap: 10px;
    visibility: hidden;
    transition: visibility 0.1s ease;
    justify-content: center;
    align-items: center;
    height: 100%;
    flex-wrap: wrap;
  }

  .set-option .icon-container{
    width: 60px;
    height: 40px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card:hover .icon-container {
    visibility: visible;
  }

  .card:hover .card-text {
    visibility: hidden;
  }

  .set-option img {
    width: 90px;
  }

  .set-option .icon-container:hover {
    transform: scale(1.1);
    cursor: pointer;

  }

</style>