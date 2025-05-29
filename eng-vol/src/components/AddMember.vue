<script setup>
// Import các thành phần và hàm cần thiết
import OverlayBackground from './OverlayBackground.vue'; // Import component OverlayBackground để hiển thị nền overlay
import { defineEmits, ref, watch } from 'vue'; // Import các hàm reactive và lifecycle hooks từ Vue
import { checkInviteExistance, inviteUser, revokeUser } from '@/apis/classApi'; // Import các API liên quan đến lớp học

// Định nghĩa các sự kiện phát ra từ component
const emit = defineEmits(['close', 'save']); // Sự kiện 'close' để đóng overlay và 'save' để lưu dữ liệu

// Biến reactive để quản lý trạng thái và dữ liệu
const visible = ref(true); // Trạng thái hiển thị của overlay
const className = localStorage.getItem('className'); // Lấy tên lớp học từ localStorage
const inviteRovokeMode = ref('Invite'); // Trạng thái nút (Invite hoặc Revoke)
const invitee = ref(""); // Tên người được mời
const classId = localStorage.getItem('classId'); // Lấy ID lớp học từ localStorage
const invitationId = ref(""); // ID của lời mời
const token = localStorage.getItem('token'); // Lấy token từ localStorage

// Hàm đóng overlay
function closeOverlay() {
  emit('close'); // Phát sự kiện 'close' để đóng overlay
}

// Hàm kiểm tra sự tồn tại của lời mời
const fetchInvite = async () => {
  try {
    const response = await checkInviteExistance(invitee.value, classId, token); // Gọi API để kiểm tra lời mời
    invitationId.value = response.classInvitationId; // Lưu ID lời mời
    if (response.classInvitationId) {
      inviteRovokeMode.value = "Revoke"; // Cập nhật trạng thái nút thành "Revoke" nếu lời mời tồn tại
    }
  } catch (error) {
    console.error('Error while calling API:', error); // Log lỗi nếu có
  }
};

// Hàm xử lý mời người dùng
const handleInviteUser = async () => {
  try {
    const message = await inviteUser(classId, invitee.value, token); // Gọi API để mời người dùng
    alert(message); // Hiển thị thông báo thành công
    inviteRovokeMode.value = "Revoke"; // Cập nhật trạng thái nút thành "Revoke"
    fetchInvite(); // Làm mới trạng thái lời mời
  } catch (error) {
    console.log(error); // Log lỗi nếu có
    alert(error); // Hiển thị thông báo lỗi
  }
};

// Hàm xử lý hủy lời mời
const handleRevokeUser = async () => {
  try {
    fetchInvite(); // Làm mới trạng thái lời mời
    if (!invitationId.value) {
      console.error('Invitation ID is missing'); // Log lỗi nếu không có ID lời mời
      return;
    }
    const message = await revokeUser(invitationId.value, token); // Gọi API để hủy lời mời
    alert(message); // Hiển thị thông báo thành công
    inviteRovokeMode.value = "Invite"; // Cập nhật trạng thái nút thành "Invite"
  } catch (error) {
    alert(error); // Hiển thị thông báo lỗi
  }
};

// Hàm xử lý mời hoặc hủy lời mời
const inviteRevokeUser = () => {
  if (inviteRovokeMode.value === "Invite") {
    handleInviteUser(); // Gọi hàm mời người dùng nếu trạng thái là "Invite"
  } else {
    handleRevokeUser(); // Gọi hàm hủy lời mời nếu trạng thái là "Revoke"
  }
};

// Theo dõi sự thay đổi của tên người được mời
watch(invitee, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    fetchInvite(); // Làm mới trạng thái lời mời khi tên người được mời thay đổi
    inviteRovokeMode.value = "Invite"; // Cập nhật trạng thái nút thành "Invite"
  }
});
</script>

<template>
    <OverlayBackground :isVisible="visible" @clickOverlay="closeOverlay"> </OverlayBackground>
    <div class="container">
        <div class="header">
            <p>Class:</p>
            <div class="className">
                {{ className }}
            </div>

            <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
        </div>
        <div class="invitee">
            <p>Username:</p>
            <input type="text" v-model="invitee" placeholder="Enter username">
        </div>
        <div class="button">
            <button class="invite" @click="inviteRevokeUser">{{inviteRovokeMode}}</button>
            <button class="cancel" @click="closeOverlay">Cancel</button>
        </div>
    </div>
</template>

<style scoped>
.container {
    position: fixed;
    top: 25vh;
    left: 35vw;
    display: flex;
    flex-direction: column;
    height: 50vh;
    width: 30vw;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background-color: white;
    overflow: hidden;
    z-index: 11;
}

.header {
    position: absolute;
    height: 50px;
    background-color: #BDEDF5;
    width: 100%;
    top: 0;
    display: flex;
    align-items: center;
}

.header .className {
    width: 50%;
    height: 30px;
    margin-left: 5px;
    border-radius: 5px;
    background-color: white;
    text-align: center;
    align-items: center;
}

.header p {
    margin-left: 17%;
}

.close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
}

.invitee {
    display: flex;
    margin-top: 30px;
}

.invitee input {
    width: 60%;
    height: 30px;
    margin-left: 10px;
}

button {
    height: 30px;
    width: 70px;
    border-radius: 5px;
    border: none;
    box-shadow: 2px 2px 2px #bcbcbc;
    margin: 50px 20px 20px 0;
}

.invite {
    background-color: #BDEDF5;
}

.invite:hover {
    background-color: #61e5fd;
}

.cancel {
    background-color: #FF9FA8;
}

.cancel:hover {
    background-color: #f37c88;
}
</style>