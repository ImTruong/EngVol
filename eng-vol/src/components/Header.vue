<script setup>
import { ref, watch, defineProps, computed, onMounted } from 'vue'; // Import các hàm reactive và lifecycle hooks từ Vue
import { RouterLink } from 'vue-router'; // Import RouterLink để điều hướng giữa các trang
import SetTable from "../components/SetTable.vue"; // Import component SetTable để hiển thị bảng thông tin bộ flashcard
import OverlayBackground from "../components/OverlayBackground.vue"; // Import component OverlayBackground để hiển thị nền overlay
import SeachBar from './SeachBar.vue'; // Import component SeachBar để thực hiện tìm kiếm
import ClassTable from './ClassTable.vue'; // Import component ClassTable để hiển thị bảng thông tin lớp học
import NotificationList from './NotificationList.vue'; // Import component NotificationList để hiển thị danh sách thông báo
import { useStore } from 'vuex'; // Import Vuex để quản lý trạng thái toàn cục

// Định nghĩa các sự kiện phát ra từ component
const emit = defineEmits(['reload']); // Sự kiện reload để làm mới dữ liệu

// Khởi tạo store để truy cập trạng thái toàn cục
const store = useStore();

// Định nghĩa các props được truyền vào component
const props = defineProps({
  recentSets: { type: Array, default: () => [] }, // Danh sách bộ flashcard gần đây
  ownerSets: { type: Array, default: () => [] }, // Danh sách bộ flashcard của người dùng
  publicSets: { type: Array, default: () => [] }, // Danh sách bộ flashcard công khai
});

// Biến reactive để quản lý trạng thái và dữ liệu
const setsData = ref([...props.recentSets, ...props.ownerSets, ...props.publicSets]); // Tổng hợp danh sách bộ flashcard
watch(() => [props.recentSets, props.ownerSets, props.publicSets], () => {
  setsData.value = [...props.recentSets, ...props.ownerSets, ...props.publicSets]; // Cập nhật danh sách khi props thay đổi
});

const isEditMode = ref(false); // Trạng thái chỉnh sửa
const existingSet = ref(null); // Bộ flashcard hiện tại
const menuOpen = ref(false); // Trạng thái mở menu
const showNotifications = ref(false); // Trạng thái hiển thị thông báo
const setTable = ref(false); // Trạng thái hiển thị bảng flashcard
const searchQuery = ref(""); // Từ khóa tìm kiếm
const Overlay_background = ref("false"); // Trạng thái hiển thị nền overlay
const showSearch = ref(false); // Trạng thái hiển thị tìm kiếm
const searchItem = ref(""); // Từ khóa tìm kiếm
const newItem = ref(false); // Trạng thái hiển thị menu tạo mới
const classTable = ref(false); // Trạng thái hiển thị bảng lớp học
const token = localStorage.getItem('token'); // Lấy token từ localStorage

// Hàm reload dữ liệu
const reload = () => {
  emit('reload'); // Phát sự kiện reload
};

// Hàm bật/tắt menu
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value; // Thay đổi trạng thái menu
};

// Hàm bật/tắt thông báo
const toggleNotifications = () => {
  if (token == null) { // Kiểm tra nếu người dùng chưa đăng nhập
    alert('Login to use this feature'); // Hiển thị thông báo yêu cầu đăng nhập
    window.location.href = '/login'; // Điều hướng đến trang đăng nhập
  } else {
    showNotifications.value = !showNotifications.value; // Thay đổi trạng thái hiển thị thông báo
  }
};

// Hàm hiển thị bảng lớp học
const showClassTable = () => {
  if (token == null) { // Kiểm tra nếu người dùng chưa đăng nhập
    alert('Login to use this feature'); // Hiển thị thông báo yêu cầu đăng nhập
    window.location.href = '/login'; // Điều hướng đến trang đăng nhập
  } else {
    classTable.value = !classTable.value; // Thay đổi trạng thái hiển thị bảng lớp học
    newItem.value = !newItem; // Thay đổi trạng thái menu tạo mới
  }
};

// Hàm thực hiện tìm kiếm
const performSearch = (query) => {
  showSearch.value = true; // Hiển thị tìm kiếm
  Overlay_background.value = true; // Hiển thị nền overlay
  searchItem.value = query; // Cập nhật từ khóa tìm kiếm
};

// Hàm hiển thị bảng flashcard
const showSetTable = (editMode = false) => {
  if (token == null) { // Kiểm tra nếu người dùng chưa đăng nhập
    alert('Login to use this feature'); // Hiển thị thông báo yêu cầu đăng nhập
    window.location.href = '/login'; // Điều hướng đến trang đăng nhập
  } else {
    isEditMode.value = editMode; // Cập nhật trạng thái chỉnh sửa
    setTable.value = true; // Hiển thị bảng flashcard
  }
};

// Hàm xử lý bộ flashcard
const handleSet = (data) => {
  existingSet.value = data; // Cập nhật bộ flashcard hiện tại
};

// Theo dõi trạng thái menu
watch(menuOpen, (newValue) => {
  if (!newValue) {
    showNotifications.value = false; // Ẩn thông báo khi menu đóng
  }
});
</script>

<template>
    <div class="header-container">
        <OverlayBackground :isVisible="menuOpen" @clickOverlay="menuOpen = false" />
        <header>
            <div class="nav-header">
                <button class="nav-toggle" @click="toggleMenu">☰</button>
            </div>
            <div v-if="menuOpen" class="nav-menu">
                <ul>
                    <li>
                        <img src="@/assets/icons/home-icon.png" alt="Home"  class="menu-icon"/>
                        <router-link to="/" class="menu-link">Home</router-link>
                    </li>
                    <li>
                        <img src="@/assets/icons/folder.png" alt="folder"  class="menu-icon"/>
                        <router-link to="/library" class="menu-link">Your Library</router-link>
                    </li>
                    <li>
                        <img src="@/assets/icons/statistics.png" alt="Home"  class="menu-icon"/>
                        <a href="/statistics">Statistics</a>
                    </li>
                    <li>
                        <img src="@/assets/notification.svg" alt="Notification" class="menu-icon" />
                        <a href="#" @click="toggleNotifications">Notifications</a>
                        
                      </li>
                    <li>
                        <img src="@/assets/user.svg" alt="Your Profile"  class="menu-icon"/>
                        <a href="/profile">Your profile</a>
                    </li>
                    <li class="divider"></li>
                    <li>
                        <img src="@/assets/icons/logout.png" alt="Home"  class="menu-icon"/>
                        <router-link to="/login" class="login">Log out</router-link>
                    </li>
                </ul>
            </div>
            <input 
                type="text" 
                v-model="searchQuery"
                @keyup.enter="performSearch(searchQuery)" 
                placeholder="Search for flashcards sets, classes" 
                class="search-bar"/>
            <div class="button-container">
                <button class="add-button" @click="newItem = !newItem"> 
                    <img src="../assets/plus.svg" alt="Add set">
                </button>
                
                <RouterLink to="/profile" class="user-icon" >U</RouterLink>
            </div>

            <div v-if="showSearch" class="search-class">
                <SeachBar
                    :searchQuery="searchItem"
                    :Overlay_background="Overlay_background"
                    @close="Overlay_background = false"
                />
            </div>

            <div class="new-set-class-container" v-if="newItem">
                <p  @click="showSetTable(false)" >
                    <img src="../assets/new-set.svg" alt="">
                    Flashcard set
                </p>
                <p @click="showClassTable">
                    <img src="../assets/class.svg" alt="">
                    Class
                </p>
            </div>
            <SetTable 
            v-if="setTable" 
            @close="setTable = false" 
            @save="handleSet"
            :existingSet="existingSet"
            @reload="reload"
            />
            <ClassTable v-if="classTable"
                        @close="classTable = false"
                        @reload="reload"
            ></ClassTable>
            <NotificationList 
                v-if="showNotifications" 
                @click="toggleNotifications"
                class="notification-dropdown"
                :class="{ show: showNotifications }"
            />
        </header>
    </div>
</template>

<style scoped>
    .new-set-class-container{
        position: fixed;
        padding: 5px;
        top: 50px;
        right: 80px;
        width: 150px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
    }
    .new-set-class-container p{
        height: 40px;
        padding: 5px;
        font-size: 18px;
        cursor: pointer;
        border-radius: 5px;
    }

    .new-set-class-container p img{
        width: 20px;
    }

    .new-set-class-container p:hover{
        background-color: #dcdcdc;
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px;
        background-color: #DBF3F7;
        border-bottom: 1px solid #ccc;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 50.67px;
        z-index: 20; 
    }
        
    .nav-header {
        display: flex;
        align-items: center;
    }

    .nav-toggle {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #333;
    }

    .nav-menu {
        position: absolute;
        top: 50px;
        left: 0;
        width: 250px;
        height: 100vh;
        background-color: #fff;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: center;
        flex-direction: column;
        justify-content: flex-start;
        padding: 20px;
        z-index: 20;
    }

    .menu-icon {
        width: 24px;  /* Chỉnh kích thước rộng */
        height: 24px; /* Chỉnh kích thước cao */
        margin-right: 10px;
    }  

    .nav-menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .nav-menu ul li {
        display: flex;
        margin: 10px 0;
        align-items: center;
    }

    .nav-menu ul li a {
        text-decoration: none;
        color: #333;
        font-size: 14px;
        padding: 10px;
        display: block;
        font-weight: 500;
    }

    .nav-menu ul li a:hover {
        background-color: rgba(128, 128, 128, 0.263);
        color: white;
        width: 100%;
    }
    .button-container {
        position: fixed;
        right: 80px;
        display: flex; 
        /* align-items: center;  */
        /* margin-left: 10px; Khoảng cách bên trái */
    }

    .user-icon {
        position: fixed;
        right: 30px;
        font-size: 16px;
        background-color: #D9D9D9; /* Màu nền cho icon user */
        color: white; /* Màu chữ */
        width: 40px; /* Kích thước rộng của icon */
        height: 40px; /* Kích thước cao của icon */
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%; /* Tạo hình tròn */
        cursor: pointer;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    }

    .add-button {
        font-size: 20px;
        background-color: #BDEDF5;
        color: Black;
        border: none;
        padding: 0; /* Đặt padding thành 0 để giảm kích thước */
        border-radius: 4px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        transition: box-shadow 0.3s ease;
    }

    .search-bar {
        position: fixed;
        width: 60%;
        left:20%;
        height: 40px;
        padding: 0 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    }

    .divider {
        border-top: 1px solid #ccc; /* Đường kẻ màu xám nhạt */
        margin: 30px 0 10px 0; /* Khoảng cách trên dưới */
        height: 1px; /* Chiều cao của đường phân cách */
    }
    .notification-dropdown {
        position: absolute;  /* Đặt bảng thông báo ở vị trí tuyệt đối */
        top: 100px;  /* Điều chỉnh giá trị này để bảng thông báo nằm gần icon, tránh đè lên thanh menu */
        left: 230px;  /* Đặt bảng thông báo vào phía bên phải của thanh nav */
        width: 300px;  /* Chiều rộng bảng thông báo */
        background-color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        padding: 16px;
        z-index: 20; /* Đảm bảo bảng thông báo có độ ưu tiên hiển thị trên các phần tử khác */
        display: none; 
        max-height: 400px; /* Chiều cao tối đa khi có nhiều thông báo */
        overflow-y: auto; 
    }
    
    .notification-dropdown.show {
        display: block; /* Hiển thị bảng khi có class 'show' */
    }
      
</style>
