<script setup>
    import { ref, watch, defineProps, computed, onMounted} from 'vue';
    import { RouterLink } from 'vue-router';
    import SetTable from "../components/SetTable.vue"
    import OverlayBackground from "../components/OverlayBackground.vue";
    import SeachBar from './SeachBar.vue';
    import ClassTable from './ClassTable.vue';
    import NotificationList from './NotificationList.vue'
    import { useStore } from 'vuex';

    const emit = defineEmits([
        'reload'
    ]);
    const store = useStore();
    const props = defineProps({
    recentSets: {
        type: Array,
        default: () => [], 
    },
    ownerSets: {
        type: Array,
        default: () => [],
    },
    publicSets: {
        type: Array,
        default: () => [],
    },
    });
    const setsData = ref([...props.recentSets, ...props.ownerSets, ...props.publicSets]);
    watch(() => [props.recentSets, props.ownerSets, props.publicSets], () => {
    setsData.value = [...props.recentSets, ...props.ownerSets, ...props.publicSets];
    });

    const isEditMode = ref(false);
    const existingSet = ref(null);
    const menuOpen = ref(false);    
    const showNotifications = ref(false)
    const setTable = ref(false)
    const searchQuery = ref("")
    const Overlay_background = ref("false");
    const showSearch = ref(false)
    const searchItem = ref("")
    const newItem = ref(false);
    const classTable = ref(false)
    const token = localStorage.getItem('token');

    const reload = () => {
        emit('reload');
    };

    const toggleMenu = () => {
        menuOpen.value = !menuOpen.value;
    };

    const toggleNotifications = () => {
        if (token == null) {
            alert('Login to use this feature');
            window.location.href = '/login';
        }
        else{
            showNotifications.value = !showNotifications.value;
        }
    }

    const showClassTable = () =>{
        if (token == null) {
            alert('Login to use this feature');
            window.location.href = '/login';
        }
        else{
          classTable.value = !classTable.value;
          newItem.value = !newItem;
        }

    }
    const performSearch = (query) => {
        showSearch.value = true;
        Overlay_background.value = true;
        searchItem.value = query;
    };

    const showSetTable = (editMode = false) => {
        if (token == null) {
            alert('Login to use this feature');
            window.location.href = '/login';
        }
        else{
          isEditMode.value = editMode;
          setTable.value = true; // Hiển thị SetTable
        }

    };

    const handleSet = (data) => {
        existingSet.value = data;
    }
    watch(menuOpen, (newValue) => {
        if (!newValue) {
        showNotifications.value = false; 
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
