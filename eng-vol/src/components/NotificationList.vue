<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from "vue-router";
import NotificationItem from './NotificationItem.vue';
import InvitationBox from './InvitationBox.vue';
import ViewOnlySet from './OnlyViewSet.vue';
import { fetchNotifications, editReadMode } from '@/apis/notificationApi';

const notifications = ref([]);
const notiMode = ref(true);
const notification = ref("");
const requestId = ref("");
const router = useRouter();
const setRequest = ref(false);
const classRequest = ref(false);

// Tham số phân trang
const page = ref(0);
const size = ref(10); // Giảm kích thước mỗi trang để tối ưu hiệu suất
const loading = ref(false);
const hasMoreData = ref(true);
const totalElements = ref(0);
const totalPages = ref(0);

let intervalId = null;
let scrollObserver = null;

// Tham chiếu đến phần tử kết thúc để IntersectionObserver theo dõi
const endOfList = ref(null);

const fetchNotificationsData = async (reset = false) => {
  if (loading.value) return;

  try {
    loading.value = true;

    if (reset) {
      page.value = 0;
      notifications.value = [];
    }

    const token = localStorage.getItem("token");
    const response = await fetchNotifications(token, page.value, size.value);

    // Giả sử phản hồi từ BE có cấu trúc Paging với content, totalElements, totalPages
    const newNotifications = response.data.content || response.data;
    totalElements.value = response.data.totalElements || 0;
    totalPages.value = response.data.totalPages || 0;

    // Nếu đây là trang đầu tiên hoặc reset, thay thế mảng
    if (page.value === 0 || reset) {
      notifications.value = newNotifications;
    } else {
      // Ngược lại, thêm vào mảng hiện có
      notifications.value = [...notifications.value, ...newNotifications];
    }

    // Kiểm tra xem còn dữ liệu để tải không
    hasMoreData.value = page.value < totalPages.value - 1;

    // Tăng số trang cho lần tải tiếp theo
    if (newNotifications.length > 0 && hasMoreData.value) {
      page.value++;
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (error.response) {
      console.error('Response error:', error.response.data.message);
    } else {
      console.error('Network or Axios error:', error.message);
    }
  } finally {
    loading.value = false;
  }
};

// Hàm gọi khi cuộn đến cuối danh sách
const loadMoreNotifications = () => {
  if (hasMoreData.value && !loading.value) {
    fetchNotificationsData();
  }
};

// Thiết lập IntersectionObserver để theo dõi khi người dùng cuộn đến cuối danh sách
const setupIntersectionObserver = () => {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }

  scrollObserver = new IntersectionObserver((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMoreData.value) {
      loadMoreNotifications();
    }
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  if (endOfList.value) {
    scrollObserver.observe(endOfList.value);
  }
};

// Cân nhắc số lần cập nhật tự động
const setupIntervalFetch = () => {
  // Tải dữ liệu trang đầu tiên và cập nhật lại mỗi 30 giây thay vì 3 giây
  // để tránh quá nhiều request đến server
  intervalId = setInterval(() => {
    // Chỉ cập nhật trang đầu tiên
    if (!loading.value) {
      fetchNotificationsData(true); // Reset và tải lại từ đầu
    }
  }, 30000);
};

onMounted(() => {
  fetchNotificationsData();
  setupIntervalFetch();
  setupIntersectionObserver();
});

onUnmounted(() => {
  clearInterval(intervalId);
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
});

const markAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem("token");
    await editReadMode(notificationId, token);
    notifications.value = notifications.value.map(notification => {
      if (notification.id === notificationId) {
        notification.isRead = true;
      }
      return notification;
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const openModal = (notificationItem) => {
  notification.value = notificationItem;
  const type = notificationItem.type;
  markAsRead(notificationItem.id);
  if (type === 'CLASS_JOIN_REQUEST') {
    requestId.value = notificationItem.additionalInfo.classJoinRequestId;
    notiMode.value = false;
    classRequest.value = true;
  } else if (type === "CLASS_INVITATION") {
    requestId.value = notificationItem.additionalInfo.classInvitationId;
    notiMode.value = false;
    classRequest.value = true;
  } else if (notificationItem.type === "CLASS_SET_REQUEST") {
    requestId.value = notificationItem.additionalInfo.classSetRequestId;
    setRequest.value = true;
    notiMode.value = false;
  } else if (notificationItem.type === "REMINDER_STUDY_SESSION") {
    router.push('/review');
  }
};

const closeModal = () => {
  notiMode.value = true;
  classRequest.value = false;
  setRequest.value = false;
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