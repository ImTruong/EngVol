<script setup>
import { defineProps, defineEmits, onMounted, watch } from 'vue'; // Import các hàm reactive và lifecycle hooks từ Vue
import { ref } from 'vue'; // Import hàm ref để tạo biến reactive
import LibraryBody from './LibraryBody.vue'; // Import component LibraryBody để hiển thị nội dung thư viện
import { getClassesByName } from '@/apis/classApi'; // Import API để lấy danh sách lớp học theo tên
import { getSetsByName, getAllPublicSet } from '@/apis/setApi'; // Import API để lấy danh sách bộ flashcard theo tên hoặc danh sách công khai
import OverlayBackground from './OverlayBackground.vue'; // Import component OverlayBackground để hiển thị nền overlay

// Định nghĩa các props được truyền vào component
const { searchQuery, Overlay_background } = defineProps(['searchQuery', 'Overlay_background']);

// Biến reactive để quản lý phân trang cho bộ flashcard
const sets = ref([]); // Danh sách bộ flashcard
const setsPage = ref(0); // Trang hiện tại của bộ flashcard
const setsSize = ref(10); // Số lượng bộ flashcard trên mỗi trang
const setsTotalPages = ref(0); // Tổng số trang của bộ flashcard
const setsTotalElements = ref(0); // Tổng số bộ flashcard

// Biến reactive để quản lý phân trang cho lớp học
const classes = ref([]); // Danh sách lớp học
const classesPage = ref(0); // Trang hiện tại của lớp học
const classesSize = ref(10); // Số lượng lớp học trên mỗi trang
const classesTotalPages = ref(0); // Tổng số trang của lớp học
const classesTotalElements = ref(0); // Tổng số lớp học

const token = localStorage.getItem('token'); // Lấy token từ localStorage

const emit = defineEmits(); // Định nghĩa các sự kiện phát ra từ component

// Hàm đóng overlay
function closeOverlay() {
  emit('close'); // Phát sự kiện đóng overlay
}

// Hàm lấy danh sách lớp học từ API
async function getClasses() {
  try {
    const classesData = await getClassesByName(searchQuery, token, classesPage.value, classesSize.value); // Gọi API để lấy danh sách lớp học
    classes.value = classesData.content; // Lưu danh sách lớp học
    classesTotalPages.value = classesData.totalPages; // Cập nhật tổng số trang
    classesTotalElements.value = classesData.totalElements; // Cập nhật tổng số phần tử
  } catch (e) {
    console.log(e); // Log lỗi nếu có
    alert(e); // Hiển thị thông báo lỗi
  }
}

// Hàm lấy danh sách bộ flashcard từ API
async function getSets() {
  try {
    const setsData = await getSetsByName(searchQuery, token, setsPage.value, setsSize.value); // Gọi API để lấy danh sách bộ flashcard
    sets.value = setsData.content; // Lưu danh sách bộ flashcard
    setsTotalPages.value = setsData.totalPages; // Cập nhật tổng số trang
    setsTotalElements.value = setsData.totalElements; // Cập nhật tổng số phần tử
  } catch (e) {
    console.log(e); // Log lỗi nếu có
    alert(e); // Hiển thị thông báo lỗi
  }
}

// Hàm lấy danh sách bộ flashcard công khai cho khách
async function getSetsForGuest() {
  try {
    const setsData = await getAllPublicSet(setsPage.value, setsSize.value, searchQuery); // Gọi API để lấy danh sách bộ flashcard công khai
    sets.value = setsData.content; // Lưu danh sách bộ flashcard
    setsTotalPages.value = setsData.totalPages; // Cập nhật tổng số trang
    setsTotalElements.value = setsData.totalElements; // Cập nhật tổng số phần tử
  } catch (e) {
    console.log(e); // Log lỗi nếu có
    alert(e); // Hiển thị thông báo lỗi
  }
}

// Hàm xử lý thay đổi trang của bộ flashcard
const changeSetsPage = (newPage) => {
  setsPage.value = newPage; // Cập nhật trang hiện tại
  if (token != null) {
    getSets(); // Gọi hàm lấy danh sách bộ flashcard
  } else {
    getSetsForGuest(); // Gọi hàm lấy danh sách bộ flashcard công khai
  }
};

// Hàm xử lý thay đổi trang của lớp học
const changeClassesPage = (newPage) => {
  classesPage.value = newPage; // Cập nhật trang hiện tại
  getClasses(); // Gọi hàm lấy danh sách lớp học
};

// Theo dõi sự thay đổi của từ khóa tìm kiếm
watch(
    () => searchQuery, // Theo dõi giá trị của searchQuery
    (newQuery) => {
      // Đặt lại phân trang khi từ khóa tìm kiếm thay đổi
      setsPage.value = 0;
      classesPage.value = 0;

      getClasses(); // Gọi hàm lấy danh sách lớp học
      if (token != null) {
        getSets(); // Gọi hàm lấy danh sách bộ flashcard
      } else {
        getSetsForGuest(); // Gọi hàm lấy danh sách bộ flashcard công khai
      }
      console.log(sets.value); // Log danh sách bộ flashcard
      console.log(classes.value); // Log danh sách lớp học
    },
    { immediate: true } // Thực hiện ngay khi component được mount
);
</script>

<template>
  <OverlayBackground
      :isVisible="Overlay_background"
      @clickOverlay="closeOverlay" />
  <div class="classbox-container" v-if="Overlay_background">
    <div class="header">
      <h1>{{ searchQuery }}</h1>
      <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
    </div>
    <LibraryBody
        class="libraryBody"
        :sets="sets"
        :classes="classes"
        :sets-page="setsPage"
        :sets-total-pages="setsTotalPages"
        :sets-total-elements="setsTotalElements"
        :classes-page="classesPage"
        :classes-total-pages="classesTotalPages"
        :classes-total-elements="classesTotalElements"
        @change-sets-page="changeSetsPage"
        @change-classes-page="changeClassesPage"
    />
  </div>

</template>

<style scoped>

.classbox-container{
  position: fixed;
  top: 15vh;
  left: 20vw;
  height: 75vh;
  width: 60vw;

  border-radius: 8px;
  background-color: white;
  z-index: 11;
}

.header{
  position: absolute;
  top: 10px;
  width: 100%;
}


.header .close-icon{
  position: absolute;
  right: 10px;
  cursor: pointer;

}


.header h1{
  position: absolute;
  top: 0;
  bottom: 10px;
  height: 50px;
  width: 100%;
  text-align: center;
}

.classbox-container .libraryBody{
  position: absolute;
  top: 12%;
  height: 80%;
  padding: 30px;
  overflow-y: auto;
}

</style>