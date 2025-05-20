<script setup>
    import { ref, watch, defineEmits, defineProps, onMounted } from 'vue';
    import OverlayBackground from '../components/OverlayBackground.vue';
    import AddMember from './AddMember.vue';
    import { createClass, updateClassName, getMemberList, deleteMember, updateMemberRole } from '@/apis/classApi';
    import { getCurrentUser } from '@/apis/userApi';

    const emit = defineEmits(['close', 'save']);
    const props = defineProps(['isEditMode']);

    const visible = ref(true);
    const className = ref(props.isEditMode ? localStorage.getItem('className') : '');
    const memberList = ref([]);
    const selectedUsers = ref([]);
    const showSelectColumn = ref(false);
    const search = ref('');
    const showSearch = ref(false);
    const showAddMember = ref(false);
    const roleFilter = ref('Role');
    const classId = ref(null);
    const token = localStorage.getItem('token'); 
    const isDisplayRoleSetting = ref(false);

    const saveCLassName = async () => {
        const token = localStorage.getItem('token');
        const payload = {
            classId: props.isEditMode ? localStorage.getItem('classId') : null,
            name: className.value,
        };
        try {
            if (props.isEditMode) {
                const response = await updateClassName(payload, token);
                alert(response.message);
                localStorage.setItem('classId', classId.value);
                localStorage.setItem('className', className.value);
            } else {
                const response = await createClass(payload, token);
                classId.value = response.classId;
                emit('save', response);
                memberList.value = response.memberList;
                localStorage.setItem('classId', classId.value);
                localStorage.setItem('className', className.value);
            }
        } catch (error) {
            console.log(error)
            alert(error);
        }
    };

    const removeRow = async () => {
        if (selectedUsers.value.length == 0) return;
        const token = localStorage.getItem('token');
        const classId = localStorage.getItem('classId');
        for (const userId of selectedUsers.value) {
            try {
                const user = memberList.value.find(row => row.userId == userId);
                if (!user) {
                    alert('Không tìm thấy từ với ID:', userId);
                    continue;
                }
                await deleteMember(userId, classId, token);
                memberList.value = memberList.value.filter(row => row.userId !== userId);
                if (memberList.value.length == 0) {
                    emit('close');
                }
            } catch (error) {
                alert(error);
            }
        }
        selectedUsers.value = [];
        emit('update', memberList.value);
    };

    const closeForm = () => {
        emit('close');
        visible.value = false;
    };

    const toggleSelectMember = (userId) => {
        const index = selectedUsers.value.indexOf(userId);
        if (index == -1) {
            selectedUsers.value.push(userId);
        } else {
            selectedUsers.value.splice(index, 1);
        }
    };

    const toggleSelectColumn = () => {
        showSelectColumn.value = !showSelectColumn.value;
    };

    watch([search, showSearch], () => {
        if (!showSearch.value || search.value == "") {
            getMember();
        } else {
            memberList.value = memberList.value.filter(member => member.userName.toLowerCase().includes(search.value.toLowerCase()));
        }
    });

    const toggleSearch = () => {
        showSearch.value = !showSearch.value;
        search.value = "";
    };

    const openAddMember = () => {
        showAddMember.value = true;
        visible.value = false;
    };

    const handleSaveClassName = () => {
        if (className.value.trim()) {
            saveCLassName();
        } else {
            alert("Class name is empty!");
        }
    };

    const getMember = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await getMemberList(classId.value, token);
            memberList.value = response;
        } catch (error) {
            alert(error);
        }
    };

    const closeAddMember = () => {
        getMember();
        showAddMember.value = false;
        visible.value = true;
    };

    const updateRole = async (user) => {
        const payload = {
            userId: user.userId,
            classId: classId.value,
            role: user.role,
        };
        try {
            if (user.role !== "ADMIN") 
                throw new Error("You can't change the role");
            await updateMemberRole(payload, token);
        } catch (error) {
            user.role = user.role == "ADMIN" ? "MEMBER" : "ADMIN";
            alert(error);
        }
    };

    onMounted(async () => {
        if (props.isEditMode) {
            classId.value = localStorage.getItem('classId');
            className.value = localStorage.getItem('className');
            await getMember();
            const currentUser = await getCurrentUser(token);
            console.log(memberList.value)
            for (let i = 0; i < memberList.value.length; i++) {
                if (memberList.value[i].role == "ADMIN" && memberList.value[i].userName == currentUser.username) {
                    isDisplayRoleSetting.value = true;
                    break;
                }
            }
        }
    });

    watch(roleFilter, () => {
        if (roleFilter.value == "Role") {
            getMember();
        } else {
            memberList.value = memberList.value.filter(member => member.role == roleFilter.value);
        }
    });
</script>


<template>
    <OverlayBackground :isVisible="visible" @clickOverlay="closeForm" />
    <div v-if="visible" class="class-window">
        <div class="class-header">
            <img src="../assets/search_icon.svg" alt="Status" @click="toggleSearch" class="search-icon">
            <input v-model.trim="search" v-if="showSearch" type="text" placeholder="Search for username" class="search-bar">
            <div class="class-name" v-if="!showSearch">
                <label for="class-name">Class:</label>
                <input id="class-name" v-model="className" placeholder="Enter class name" />
            </div>
            <button @click="closeForm" class="close-btn">✖</button>
        </div>

        <div class="table-container">
            <!-- {{ memberList }} -->
            <table class="class-table">
                <thead>
                <tr>
                    <th v-if="showSelectColumn" class="select-column">Select</th>
                    <th class="username-column">Username</th>
                    <th>
                        <select class="role-option" v-model="roleFilter">
                            <option value="Role">Role</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MEMBER" selected>MEMBER</option>
                        </select>
                    </th>
                </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in memberList" :key="index">
                        <td v-if="showSelectColumn">
                            <input type="checkbox" @change="toggleSelectMember(row.userId)" :checked="selectedUsers.includes(row.userId)" />
                        </td>
                        <td class="username-column"><p>{{row.userName}}</p></td>
                        <td class="role">
                            <p v-if="!isDisplayRoleSetting">{{ row.role }}</p>
                            <!-- Thay input bằng select -->
                            <select v-if="row.role&&isDisplayRoleSetting" class="role-option" v-model="row.role" @change="updateRole(row)">
                                <option value="ADMIN">ADMIN</option>
                                <option value="MEMBER" selected>MEMBER</option>
                            </select>
                        </td>              
                    </tr>
                </tbody>
            </table>
        </div>
    
        <div class="actions">
            <button @click="toggleSelectColumn" class="icon-button">
                <img src="../assets/select.svg" alt="" class="icon">
            </button>
            <button @click="removeRow" class="icon-button">
                <img src="../assets/delete-word.svg" alt="" class="icon">
            </button>
            <button @click="openAddMember" class="icon-button">
                <img src="../assets/add-word.svg" alt="" class="icon">
            </button>
            <button @click="handleSaveClassName" class="icon-button">
                <img src="../assets/save.svg" alt="" class="icon">
            </button>
        </div>
    </div>
    
    <AddMember :setName="setName" v-if="showAddMember" @close="closeAddMember"></AddMember>
</template>  

<style scoped>
    .class-window {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        padding: 20px;
        width: 40%;
        z-index: 1000;
    }
  
    .class-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .search-icon {
        height: 20px;
        cursor: pointer;
    }

    .search-icon:hover {
        transform: scale(1.1);
    }
  
    .class-header img {
        margin-left: 10px;
    }
    
    .class-header .search-bar {
        margin-left: 10px;
        padding: 5px;
        border: 1px solid black;
        border-radius: 4px;
        text-align: center;
        width: 50%;
    }

    .class-name {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
    }

    .class-name input {
        margin-left: 10px;
        padding: 5px;
        border: 1px solid black;
        border-radius: 4px;
        text-align: center;
        width: 50%;
    }
  
    .table-container {
        max-height: 300px;
        overflow-y: auto;
        margin-top: 20px;
        flex-grow: 1;
        position: relative;
    }

    .class-table {
        min-height: 70px;
        width: 100%;
        margin-top: 10px;
        border-collapse: collapse; /* Bỏ khoảng cách giữa các cột */
    }

    .class-table thead th {
        background-color: #A8D5E5;
        border: 1px solid black;
        position: sticky;
        top: 0; /* Cố định hàng tiêu đề khi cuộn */
        z-index: 1; /* Đảm bảo hàng tiêu đề luôn nằm trên cùng */
    }

    .class-table th {
        padding: 5px;
        border: 1px solid #ccc;
        text-align: center;
    }

    .class-table th select {
        background-color: #A8D5E5;
        width: 80px;
        border: none;
    }
    
    .class-table th option {
        height: 25px;
        background-color: #ffffff;
    }

    .class-table td {
        padding: 5px;
        border: 1px solid #ccc;
        text-align: center;
    }

    .role-option {
        width: 80px;
        height: 25px;
        cursor: pointer;
    }

    .select-column {
        width: 50px; /* Chiều rộng cho cột Select */
    }
    
    .username-column {
        width: 300px;
    }

    .username-column p {
        text-align: left;
        margin-left: 10px;
    }
  
    .actions {
        display: flex;
        justify-content: space-around; /* Căn giữa các icon */
        margin: 5px;
        margin-top: 15px;
    }

    .icon-button {
        cursor: pointer;
        width: 80px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        transition: background-color 0.3s;
    }

    .icon-button:hover {
        transform: scale(1.05);
    }

    .icon {
        width: 100%;
        height: auto;
        cursor: pointer;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
    }

    td.role p{
      font-weight: bolder;
    }

    
</style>