<script setup>
import { defineProps, defineEmits, onMounted, ref } from 'vue'; // Import các hàm reactive và lifecycle hooks từ Vue
import OverlayBackground from './OverlayBackground.vue'; // Import component OverlayBackground để hiển thị nền overlay
import { joinClass, revokeJoinRequest, getJoinRequest } from '@/apis/classApi'; // Import các API liên quan đến lớp học

// Biến reactive để quản lý trạng thái và dữ liệu
const joinRequestId = ref(""); // ID của yêu cầu tham gia lớp học
const classId = localStorage.getItem('classId'); // Lấy ID lớp học từ localStorage
const joinRevokeMode = ref("Join"); // Trạng thái nút (Join hoặc Revoke)
const token = localStorage.getItem('token'); // Lấy token từ localStorage

// Định nghĩa các props được truyền vào component
const { classItem, Overlay_background } = defineProps(['classItem', 'Overlay_background']);

// Định nghĩa sự kiện phát ra từ component
const emit = defineEmits();

// Hàm đóng overlay
function closeOverlay() {
  emit('close'); // Phát sự kiện đóng overlay
}

// Hàm xử lý nút tham gia hoặc hủy yêu cầu tham gia lớp học
const join_button = async () => {
  if (!token) { // Kiểm tra nếu người dùng chưa đăng nhập
    window.location.href = '/login'; // Điều hướng đến trang đăng nhập
    alert('Login for to use this feature'); // Hiển thị thông báo yêu cầu đăng nhập
    return;
  }
  if (joinRevokeMode.value === "Join") { // Nếu trạng thái là "Join"
    try {
      const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage
      const userId = user.id; // Lấy ID người dùng
      const response = await joinClass(classId, userId, token); // Gọi API để tham gia lớp học
      await fetchJoinRequest(); // Làm mới trạng thái yêu cầu tham gia
      alert(response.message); // Hiển thị thông báo thành công
    } catch (error) {
      console.error('Error while joining the class:', error); // Log lỗi nếu có
      alert('Error while joining the class:', error); // Hiển thị thông báo lỗi
    }
  } else { // Nếu trạng thái là "Revoke"
    try {
      const response = await revokeJoinRequest(joinRequestId.value, token); // Gọi API để hủy yêu cầu tham gia
      await fetchJoinRequest(); // Làm mới trạng thái yêu cầu tham gia
      alert(response.message); // Hiển thị thông báo thành công
    } catch (error) {
      console.error('Error while revoking join request:', error); // Log lỗi nếu có
      alert('Error while revoking join request:', error); // Hiển thị thông báo lỗi
    }
  }
};

// Hàm lấy trạng thái yêu cầu tham gia lớp học
const fetchJoinRequest = async () => {
  try {
    const response = await getJoinRequest(classId, token); // Gọi API để lấy trạng thái yêu cầu tham gia
    joinRequestId.value = response.classJoinRequestId; // Lưu ID yêu cầu tham gia
    joinRevokeMode.value = "Revoke"; // Cập nhật trạng thái nút thành "Revoke"
  } catch (error) {
    joinRevokeMode.value = "Join"; // Cập nhật trạng thái nút thành "Join"
    console.error('Error while fetching join request:', error); // Log lỗi nếu có
  }
};

// Lifecycle hook khi component được mount
onMounted(() => {
  fetchJoinRequest(); // Gọi hàm lấy trạng thái yêu cầu tham gia khi component được mount
});
</script>

<template>
  <OverlayBackground
      :isVisible="Overlay_background"
      @clickOverlay="closeOverlay" />
  <div class="class-container" @click.stop>
    <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
    <div class="class-info">
      <div class="class-header">
        <img src="../assets/class.svg" alt="class-icon">
        <h1>{{ classItem.className }}</h1>
      </div>
      <p class="class-details">{{ classItem.numberOfSets }} {{ classItem.numberOfMembers === 1 ? 'set' : 'sets' }} | {{ classItem.numberOfMembers }} {{ classItem.numberOfMembers === 1 ? 'member' : 'members' }}</p>
      <div class="join-button" @click="join_button">
        <p>{{ joinRevokeMode }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
    .class-container {
        position: fixed;
        top: 25%;
        left: 35%;
        padding: 10px;
        z-index: 15;
        padding: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5%;
        width: 30%;
        height: 50%;
        background-color: white;
        overflow: hidden;
    }

    .class-container .close-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
    }

    .class-container .class-info {
        position: absolute;
        text-align: center;
        justify-content: center;
    }

    .class-info .class-header {
        position: relative;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .class-info .class-details {
        margin-bottom: 20px;
    }

    .join-button {
        background-color: #BDEDF5;
        padding: 10px 20px;
        width: 100px;
        border-radius: 20px;
        cursor: pointer;
        display: inline-block;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.15);
    }

    .join-button p {
        margin: 0;
        font-size: 18px;
        color: #333;
    }

    .join-button:hover {
        background-color: #91e3df;
    }
</style>