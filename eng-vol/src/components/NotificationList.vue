<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from "vue-router";
import NotificationItem from './NotificationItem.vue';
import InvitationBox from './InvitationBox.vue';
import ViewOnlySet from './OnlyViewSet.vue';
import { fetchNotifications, editReadMode } from '@/apis/notificationApi';

// Khởi tạo mảng lưu thông báo, sử dụng ref để theo dõi thay đổi
const notifications = ref([]);
// Trạng thái hiển thị modal thông báo (true: hiển thị danh sách, false: hiển thị modal chi tiết)
const notiMode = ref(true);
// Lưu thông tin chi tiết của thông báo được chọn
const notification = ref("");
// Lưu ID của yêu cầu (request) liên quan đến thông báo
const requestId = ref("");
// Khởi tạo router để điều hướng trang
const router = useRouter();
// Trạng thái hiển thị modal cho yêu cầu set học tập
const setRequest = ref(false);
// Trạng thái hiển thị modal cho yêu cầu tham gia/lời mời lớp học
const classRequest = ref(false);

// --- Tham số phân trang ---
// Trang hiện tại (bắt đầu từ 0)
const page = ref(0);
// Số lượng thông báo mỗi trang (10 để tối ưu hiệu suất)
const size = ref(10);
// Trạng thái đang tải dữ liệu
const loading = ref(false);
// Kiểm tra còn dữ liệu để tải thêm không
const hasMoreData = ref(true);
// Tổng số thông báo
const totalElements = ref(0);
// Tổng số trang
const totalPages = ref(0);

// Biến lưu ID của setInterval để tự động cập nhật
let intervalId = null;
// Biến lưu IntersectionObserver để theo dõi cuộn trang
let scrollObserver = null;

// Tham chiếu đến phần tử cuối danh sách để IntersectionObserver theo dõi
const endOfList = ref(null);

// Hàm lấy dữ liệu thông báo từ API
const fetchNotificationsData = async (reset = false) => {
  // Nếu đang tải thì không thực hiện
  if (loading.value) return;

  try {
    // Đặt trạng thái đang tải
    loading.value = true;

    // Nếu reset = true, đặt lại trang về 0 và xóa danh sách thông báo
    if (reset) {
      page.value = 0;
      notifications.value = [];
    }

    // Lấy token từ localStorage để xác thực
    const token = localStorage.getItem("token");
    // Gọi API lấy thông báo với trang và kích thước
    const response = await fetchNotifications(token, page.value, size.value);

    // Lấy danh sách thông báo từ phản hồi API (content), hoặc toàn bộ data nếu không có content
    const newNotifications = response.data.content || response.data;
    // Cập nhật tổng số thông báo
    totalElements.value = response.data.totalElements || 0;
    // Cập nhật tổng số trang
    totalPages.value = response.data.totalPages || 0;

    // Nếu là trang đầu hoặc reset, thay thế toàn bộ danh sách
    if (page.value === 0 || reset) {
      notifications.value = newNotifications;
    } else {
      // Nếu không, thêm thông báo mới vào danh sách hiện có
      notifications.value = [...notifications.value, ...newNotifications];
    }

    // Kiểm tra xem còn trang nào để tải không
    hasMoreData.value = page.value < totalPages.value - 1;

    // Tăng số trang nếu còn dữ liệu và có thông báo mới
    if (newNotifications.length > 0 && hasMoreData.value) {
      page.value++;
    }
  } catch (error) {
    // Xử lý lỗi khi gọi API
    console.error('Lỗi khi lấy thông báo:', error);
    if (error.response) {
      console.error('Lỗi phản hồi:', error.response.data.message);
    } else {
      console.error('Lỗi mạng hoặc Axios:', error.message);
    }
  } finally {
    // Kết thúc tải, đặt lại trạng thái
    loading.value = false;
  }
};

// Hàm tải thêm thông báo khi cuộn đến cuối danh sách
const loadMoreNotifications = () => {
  // Chỉ tải nếu còn dữ liệu và không đang tải
  if (hasMoreData.value && !loading.value) {
    fetchNotificationsData();
  }
};

// Thiết lập IntersectionObserver để phát hiện khi cuộn đến cuối danh sách
const setupIntersectionObserver = () => {
  // Ngắt kết nối observer cũ nếu tồn tại
  if (scrollObserver) {
    scrollObserver.disconnect();
  }

  // Tạo mới IntersectionObserver
  scrollObserver = new IntersectionObserver((entries) => {
    const target = entries[0];
    // Nếu phần tử cuối danh sách xuất hiện trong viewport và còn dữ liệu
    if (target.isIntersecting && hasMoreData.value) {
      loadMoreNotifications();
    }
  }, {
    root: null, // Sử dụng viewport làm root
    rootMargin: '0px', // Không thêm lề
    threshold: 0.1 // Kích hoạt khi 10% phần tử cuối xuất hiện
  });

  // Theo dõi phần tử cuối danh sách
  if (endOfList.value) {
    scrollObserver.observe(endOfList.value);
  }
};

// Thiết lập tự động cập nhật thông báo định kỳ
const setupIntervalFetch = () => {
  // Tải lại dữ liệu mỗi 30 giây để cập nhật thông báo mới
  intervalId = setInterval(() => {
    // Chỉ tải nếu không đang tải
    if (!loading.value) {
      fetchNotificationsData(true); // Reset và tải lại từ trang đầu
    }
  }, 30000); // 30 giây
};

// Khi component được mount
onMounted(() => {
  // Tải dữ liệu ban đầu
  fetchNotificationsData();
  // Thiết lập tự động cập nhật
  setupIntervalFetch();
  // Thiết lập IntersectionObserver
  setupIntersectionObserver();
});

// Khi component bị hủy
onUnmounted(() => {
  // Xóa interval để tránh rò rỉ bộ nhớ
  clearInterval(intervalId);
  // Ngắt kết nối IntersectionObserver
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
});

// Hàm đánh dấu thông báo đã đọc
const markAsRead = async (notificationId) => {
  try {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    // Gọi API để cập nhật trạng thái đã đọc
    await editReadMode(notificationId, token);
    // Cập nhật trạng thái isRead trong danh sách thông báo
    notifications.value = notifications.value.map(notification => {
      if (notification.id === notificationId) {
        notification.isRead = true;
      }
      return notification;
    });
  } catch (error) {
    // Xử lý lỗi khi đánh dấu đã đọc
    console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
  }
};

// Hàm mở modal chi tiết thông báo
const openModal = (notificationItem) => {
  // Lưu thông báo được chọn
  notification.value = notificationItem;
  const type = notificationItem.type;
  // Đánh dấu thông báo là đã đọc
  markAsRead(notificationItem.id);
  // Xử lý theo loại thông báo
  if (type === 'CLASS_JOIN_REQUEST') {
    // Yêu cầu tham gia lớp học
    requestId.value = notificationItem.additionalInfo.classJoinRequestId;
    notiMode.value = false; // Ẩn danh sách, hiện modal
    classRequest.value = true; // Hiển thị modal yêu cầu lớp học
  } else if (type === "CLASS_INVITATION") {
    // Lời mời tham gia lớp học
    requestId.value = notificationItem.additionalInfo.classInvitationId;
    notiMode.value = false;
    classRequest.value = true;
  } else if (notificationItem.type === "CLASS_SET_REQUEST") {
    // Yêu cầu set học tập
    requestId.value = notificationItem.additionalInfo.classSetRequestId;
    setRequest.value = true; // Hiển thị modal set học tập
    notiMode.value = false;
  } else if (notificationItem.type === "REMINDER_STUDY_SESSION") {
    // Nhắc nhở phiên học, chuyển hướng đến trang review
    router.push('/review');
  }
};

// Hàm đóng modal
const closeModal = () => {
  // Khôi phục trạng thái ban đầu
  notiMode.value = true; // Hiện danh sách thông báo
  classRequest.value = false; // Ẩn modal yêu cầu lớp học
  setRequest.value = false; // Ẩn modal set học tập
};
</script>

<template>
  <div class="notification-list" v-if="notiMode">
    <div class="notification-header">
      <h3>Notifications</h3>
    </div>
    <div class="notification-body" @scroll="handleScroll">
      <div v-if="notifications.length === 0 && !loading" class="no-notifications">
        Không có thông báo
      </div>

      <div class="notification" v-for="notificationItem in notifications" @click="openModal(notificationItem)">
        <NotificationItem
            :key="notificationItem.id"
            :notification="notificationItem"
        />
      </div>

      <!-- Phần tử loading hiển thị khi đang tải -->
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <span>Đang tải...</span>
      </div>

      <!-- Phần tử này được sử dụng để theo dõi khi người dùng cuộn đến cuối danh sách -->
      <div ref="endOfList" class="end-of-list"></div>
    </div>
  </div>

  <InvitationBox v-if="classRequest"
                 :requestId="requestId"
                 :Overlay_background="classRequest"
                 :requestType="notification.type"
                 @close="closeModal"
  ></InvitationBox>
  <ViewOnlySet v-if="setRequest" :requestId="requestId" @close="closeModal"></ViewOnlySet>
</template>

<style scoped>
.notification-list {
  position: fixed;
  top: 30%;
  left: 240px;
  width: 300px;
  height: 400px;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 25;
  display: flex;
  flex-direction: column;
}

.notification-header {
  margin-bottom: 12px;
}

.notification-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.notification-list h3 {
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 12px;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  column-gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

.no-notifications {
  text-align: center;
  padding: 20px 0;
  color: #666;
}

.end-of-list {
  height: 10px;
  width: 100%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>