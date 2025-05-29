<script setup>
import { defineProps, defineEmits, onMounted, ref } from 'vue'; // Import các hàm reactive và lifecycle hooks từ Vue
import OverlayBackground from './OverlayBackground.vue'; // Import component OverlayBackground để hiển thị nền overlay
import { getRequest, handleAccept, handleReject } from '@/apis/classApi'; // Import các API liên quan đến lớp học

// Định nghĩa các props được truyền vào component
const { requestId, Overlay_background, requestType } = defineProps(['requestId', 'Overlay_background', 'requestType']);

// Lấy token từ localStorage để xác thực API
const token = localStorage.getItem('token');

// Biến reactive để lưu thông tin lớp học và người gửi yêu cầu
const classItem = ref(""); // Thông tin lớp học
const fromUser = ref(""); // Tên người gửi yêu cầu
const userMessgage = ref(""); // Tin nhắn hiển thị người gửi yêu cầu
const apiUrl = ref(""); // URL API tương ứng với loại yêu cầu

// Định nghĩa sự kiện phát ra từ component
const emit = defineEmits();

// Hàm đóng overlay
function closeOverlay() {
  emit('close'); // Phát sự kiện đóng overlay
}

// Hàm lấy thông tin yêu cầu từ API
const fetchRequest = async () => {
  // Xác định URL API dựa trên loại yêu cầu
  if (requestType === "CLASS_JOIN_REQUEST") {
    apiUrl.value = `/class/request/join/${requestId}`;
  } else if (requestType === "CLASS_INVITATION") {
    apiUrl.value = `/class/invitation/${requestId}`;
  }
  try {
    // Gọi API để lấy thông tin yêu cầu
    const response = await getRequest(apiUrl.value, token);
    classItem.value = response.data.classInformationResponse; // Lưu thông tin lớp học

    // Xử lý thông tin người gửi yêu cầu dựa trên loại yêu cầu
    if (requestType === "CLASS_JOIN_REQUEST") {
      fromUser.value = response.requesterName; // Tên người yêu cầu tham gia
      userMessgage.value = "Requester: "; // Tin nhắn hiển thị
    } else if (requestType === "CLASS_INVITATION") {
      fromUser.value = response.inviterUsername; // Tên người mời
      userMessgage.value = "Inviter: "; // Tin nhắn hiển thị
    }
  } catch (error) {
    console.error('Error fetching request:', error); // Log lỗi nếu có
  }
};

// Hàm chấp nhận yêu cầu
const acceptRequest = async () => {
  // Xác định URL API dựa trên loại yêu cầu
  if (requestType === "CLASS_JOIN_REQUEST") {
    apiUrl.value = `/class/request/join/accept?requestId=${requestId}`;
  } else if (requestType === "CLASS_INVITATION") {
    apiUrl.value = `/class/invitation/accept?invitationId=${requestId}`;
  }
  try {
    // Gọi API để chấp nhận yêu cầu
    const response = await handleAccept(apiUrl.value, token);
    alert(response); // Hiển thị thông báo thành công
    closeOverlay(); // Đóng overlay
  } catch (error) {
    alert(error); // Hiển thị lỗi nếu có
  }
};

// Hàm từ chối yêu cầu
const rejectRequest = async () => {
  // Xác định URL API dựa trên loại yêu cầu
  if (requestType === "CLASS_JOIN_REQUEST") {
    apiUrl.value = `/class/request/join/reject?requestId=${requestId}`;
  } else if (requestType === "CLASS_INVITATION") {
    apiUrl.value = `/class/invitation/reject?invitationId=${requestId}`;
  }
  try {
    // Gọi API để từ chối yêu cầu
    const response = await handleReject(apiUrl.value, token);
    alert(response); // Hiển thị thông báo thành công
    closeOverlay(); // Đóng overlay
  } catch (error) {
    alert(error); // Hiển thị lỗi nếu có
  }
};

// Lifecycle hook khi component được mount
onMounted(() => {
  fetchRequest(); // Gọi hàm lấy thông tin yêu cầu khi component được mount
});
</script>

<template>
  <OverlayBackground
      :isVisible="Overlay_background"
      @clickOverlay="closeOverlay" />
  <div class="class-container" v-if="Overlay_background">
    <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
    <div class="class-info">
      <div class="class-header">
        <img src="../assets/class.svg" alt="class-icon">
        <h1>{{ classItem.className }}</h1>
      </div>
      <p>{{ classItem.numberOfSets }} {{ classItem.numberOfMembers <= 1 ? 'set' : 'sets' }} | {{ classItem.numberOfMembers }} {{ classItem.numberOfMembers <= 1 ? 'member' : 'members' }}</p>
      <p class="fromUser">{{ userMessgage }} {{ fromUser }}</p>
      <div class="button">
        <div class="accept-button" @click="acceptRequest">
          <p>Accept</p>
        </div>
        <div class="reject-button" @click="rejectRequest">
          <p>Reject</p>
        </div>
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

.class-info .fromUser {
  margin-bottom: 20px;
}

.button {
  display: flex;
}

.accept-button {
  background-color: #BDEDF5;
  padding: 10px;
  width: 100px;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.15);
}

.reject-button {
  background-color: #FF9FA8;
  padding: 10px;
  width: 100px;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.15);
  margin-left: 10px;
}

.button p {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.accept-button:hover {
  background-color: #91e3df;
}

.reject-button:hover {
  background-color: #f37c88;
}
</style>