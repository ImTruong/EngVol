<script setup>
import Header from '@/components/Header.vue'; // Import component Header
import LibraryBody from "@/components/LibraryBody.vue"; // Import component LibraryBody
import { getLibrarySet } from "@/apis/setApi.js"; // Import API để lấy dữ liệu thư viện
import { getCurrentUserClasses } from "@/apis/classApi.js"; // Import API để lấy danh sách lớp học của người dùng
import { onMounted, ref } from "vue"; // Import các hàm và biến reactive từ Vue

const token = localStorage.getItem('token'); // Lấy token từ localStorage để xác thực

// Các biến reactive để quản lý phân trang cho sets
const sets = ref(null); // Lưu danh sách sets
const setsPage = ref(0); // Trang hiện tại của sets
const setsSize = ref(12); // Số lượng sets trên mỗi trang
const setsTotalPages = ref(0); // Tổng số trang của sets
const setsTotalElements = ref(0); // Tổng số phần tử của sets

// Các biến reactive để quản lý phân trang cho classes
const classes = ref(null); // Lưu danh sách classes
const classesPage = ref(0); // Trang hiện tại của classes
const classesSize = ref(10); // Số lượng classes trên mỗi trang
const classesTotalPages = ref(0); // Tổng số trang của classes
const classesTotalElements = ref(0); // Tổng số phần tử của classes

// Hàm lấy dữ liệu cho sets từ API
const fetchSets = async () => {
  try {
    const setsData = await getLibrarySet(token, setsPage.value, setsSize.value); // Gọi API để lấy dữ liệu sets
    sets.value = setsData.content; // Lưu danh sách sets vào biến reactive
    setsTotalPages.value = setsData.totalPages; // Cập nhật tổng số trang
    setsTotalElements.value = setsData.totalElements; // Cập nhật tổng số phần tử
  } catch (error) {
    console.error("Error fetching sets:", error); // Log lỗi nếu có
  }
};

// Hàm lấy dữ liệu cho classes từ API
const fetchClasses = async () => {
  try {
    const classesData = await getCurrentUserClasses(token, classesPage.value, classesSize.value); // Gọi API để lấy dữ liệu classes
    classes.value = classesData.content; // Lưu danh sách classes vào biến reactive
    classesTotalPages.value = classesData.totalPages; // Cập nhật tổng số trang
    classesTotalElements.value = classesData.totalElements; // Cập nhật tổng số phần tử
  } catch (error) {
    console.error("Error fetching classes:", error); // Log lỗi nếu có
  }
};

// Hàm xử lý khi thay đổi trang của sets
const changeSetsPage = (newPage) => {
  setsPage.value = newPage; // Cập nhật trang hiện tại
  fetchSets(); // Gọi lại hàm fetchSets để lấy dữ liệu mới
};

// Hàm xử lý khi thay đổi trang của classes
const changeClassesPage = (newPage) => {
  classesPage.value = newPage; // Cập nhật trang hiện tại
  fetchClasses(); // Gọi lại hàm fetchClasses để lấy dữ liệu mới
};

// Hàm xử lý reload dữ liệu
const handleReload = async () => {
  console.log("Reload triggered in YourLibrary"); // Log thông báo reload
  await new Promise(resolve => setTimeout(resolve, 300)); // Tạm dừng 300ms
  await fetchSets(); // Reload dữ liệu sets
  await fetchClasses(); // Reload dữ liệu classes
};

// Hàm được gọi khi component được mount
onMounted(() => {
  if (token == null) { // Kiểm tra nếu không có token
    alert('Login to use this feature'); // Hiển thị thông báo yêu cầu đăng nhập
    window.location.href = '/login'; // Chuyển hướng đến trang đăng nhập
    return;
  }
  fetchSets(); // Lấy dữ liệu sets
  fetchClasses(); // Lấy dữ liệu classes
});
</script>

<template>
  <div id="app">
    <!-- Hiển thị Header -->
    <Header @reload="handleReload" />
    <main>
      <h2>Your library</h2>
      <!-- Hiển thị LibraryBody với các props và sự kiện -->
      <LibraryBody
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
          @reload="handleReload"
      />
    </main>
  </div>
</template>

<style scoped>
main {
  padding: 100px; /* Khoảng cách padding cho main */
}
h2 {
  font-weight: bold; /* Định dạng chữ đậm */
  margin-bottom: 30px; /* Khoảng cách dưới */
}
</style>