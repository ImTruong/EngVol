<!--<script setup>-->
<!--    import { ref, watch, defineEmits, defineProps, onMounted } from 'vue';-->
<!--    import OverlayBackground from '../components/OverlayBackground.vue';-->
<!--    import AddMember from './AddMember.vue';-->
<!--    import { createClass, updateClassName, getMemberList, deleteMember, updateMemberRole } from '@/apis/classApi';-->
<!--    import { getCurrentUser } from '@/apis/userApi';-->

<!--    const emit = defineEmits(['close', 'save', 'reload']);-->
<!--    const props = defineProps(['isEditMode']);-->

<!--    const visible = ref(true);-->
<!--    const className = ref(props.isEditMode ? localStorage.getItem('className') : '');-->
<!--    const memberList = ref([]);-->
<!--    const selectedUsers = ref([]);-->
<!--    const showSelectColumn = ref(false);-->
<!--    const search = ref('');-->
<!--    const showSearch = ref(false);-->
<!--    const showAddMember = ref(false);-->
<!--    const roleFilter = ref('Role');-->
<!--    const classId = ref(null);-->
<!--    const token = localStorage.getItem('token');-->
<!--    const isDisplayRoleSetting = ref(false);-->
<!--    const page = ref(0);-->
<!--    const size = ref(10);-->

<!--    const saveCLassName = async () => {-->
<!--        const token = localStorage.getItem('token');-->
<!--        const payload = {-->
<!--            classId: props.isEditMode ? localStorage.getItem('classId') : null,-->
<!--            name: className.value,-->
<!--        };-->
<!--        try {-->
<!--            if (props.isEditMode) {-->
<!--                const response = await updateClassName(payload, token);-->
<!--                alert(response);-->
<!--                localStorage.setItem('classId', classId.value);-->
<!--                localStorage.setItem('className', className.value);-->
<!--            } else {-->
<!--                const response = await createClass(payload, token);-->
<!--                classId.value = response.classId;-->
<!--                emit('save', response);-->
<!--                emit('reload');-->
<!--                memberList.value = response.memberList;-->
<!--                localStorage.setItem('classId', classId.value);-->
<!--                localStorage.setItem('className', className.value);-->
<!--            }-->
<!--        } catch (error) {-->
<!--            console.log(error)-->
<!--            alert(error);-->
<!--        }-->
<!--    };-->

<!--    const removeRow = async () => {-->
<!--        if (selectedUsers.value.length == 0) return;-->
<!--        const token = localStorage.getItem('token');-->
<!--        const classId = localStorage.getItem('classId');-->
<!--        for (const userId of selectedUsers.value) {-->
<!--            try {-->
<!--                const user = memberList.value.find(row => row.userId == userId);-->
<!--                if (!user) {-->
<!--                    alert('Không tìm thấy từ với ID:', userId);-->
<!--                    continue;-->
<!--                }-->
<!--                alert(await deleteMember(userId, classId, token));-->
<!--                memberList.value = memberList.value.filter(row => row.userId !== userId);-->
<!--                if (memberList.value.length == 0) {-->
<!--                    emit('close');-->
<!--                }-->
<!--                emit('reload')-->
<!--            } catch (error) {-->
<!--                alert(error);-->
<!--            }-->
<!--        }-->
<!--        selectedUsers.value = [];-->
<!--        emit('update', memberList.value);-->
<!--    };-->

<!--    const closeForm = () => {-->
<!--        emit('close');-->
<!--        visible.value = false;-->
<!--    };-->

<!--    const toggleSelectMember = (userId) => {-->
<!--        const index = selectedUsers.value.indexOf(userId);-->
<!--        if (index == -1) {-->
<!--            selectedUsers.value.push(userId);-->
<!--        } else {-->
<!--            selectedUsers.value.splice(index, 1);-->
<!--        }-->
<!--    };-->

<!--    const toggleSelectColumn = () => {-->
<!--        showSelectColumn.value = !showSelectColumn.value;-->
<!--    };-->

<!--    watch([search, showSearch], () => {-->
<!--        if (!showSearch.value || search.value == "") {-->
<!--            getMember();-->
<!--        } else {-->
<!--            memberList.value = memberList.value.filter(member => member.userName.toLowerCase().includes(search.value.toLowerCase()));-->
<!--        }-->
<!--    });-->

<!--    const toggleSearch = () => {-->
<!--        showSearch.value = !showSearch.value;-->
<!--        search.value = "";-->
<!--    };-->

<!--    const openAddMember = () => {-->
<!--        showAddMember.value = true;-->
<!--        visible.value = false;-->
<!--    };-->

<!--    const handleSaveClassName = () => {-->
<!--        if (className.value.trim()) {-->
<!--            saveCLassName();-->
<!--        } else {-->
<!--            alert("Class name is empty!");-->
<!--        }-->
<!--    };-->

<!--    const getMember = async () => {-->
<!--        try {-->
<!--            const token = localStorage.getItem('token');-->
<!--            const response = await getMemberList(classId.value, token, page.value, size.value);-->
<!--            memberList.value = response.memberList;-->
<!--        } catch (error) {-->
<!--            alert(error);-->
<!--        }-->
<!--    };-->

<!--    const closeAddMember = () => {-->
<!--        getMember();-->
<!--        showAddMember.value = false;-->
<!--        visible.value = true;-->
<!--    };-->

<!--    const updateRole = async (user) => {-->
<!--        const payload = {-->
<!--            userId: user.userId,-->
<!--            classId: classId.value,-->
<!--            role: user.role,-->
<!--        };-->
<!--        try {-->
<!--            alert(await updateMemberRole(payload, token));-->
<!--        } catch (error) {-->
<!--            user.role = user.role == "ADMIN" ? "MEMBER" : "ADMIN";-->
<!--            alert(error);-->
<!--        }-->
<!--    };-->

<!--    onMounted(async () => {-->
<!--        if (props.isEditMode) {-->
<!--            classId.value = localStorage.getItem('classId');-->
<!--            className.value = localStorage.getItem('className');-->
<!--            await getMember();-->
<!--            const currentUser = await getCurrentUser(token);-->
<!--            for (let i = 0; i < memberList.value.length; i++) {-->
<!--                if (memberList.value[i].role == "ADMIN" && memberList.value[i].userName == currentUser.username) {-->
<!--                    isDisplayRoleSetting.value = true;-->
<!--                    break;-->
<!--                }-->
<!--            }-->
<!--        }-->
<!--    });-->

<!--    watch(roleFilter, () => {-->
<!--        if (roleFilter.value == "Role") {-->
<!--            getMember();-->
<!--        } else {-->
<!--            memberList.value = memberList.value.filter(member => member.role == roleFilter.value);-->
<!--        }-->
<!--    });-->
<!--</script>-->


<!--<template>-->
<!--    <OverlayBackground :isVisible="visible" @clickOverlay="closeForm" />-->
<!--    <div v-if="visible" class="class-window">-->
<!--        <div class="class-header">-->
<!--            <img src="../assets/search_icon.svg" alt="Status" @click="toggleSearch" class="search-icon">-->
<!--            <input v-model.trim="search" v-if="showSearch" type="text" placeholder="Search for username" class="search-bar">-->
<!--            <div class="class-name" v-if="!showSearch">-->
<!--                <label for="class-name">Class:</label>-->
<!--                <input id="class-name" v-model="className" placeholder="Enter class name" />-->
<!--            </div>-->
<!--            <button @click="closeForm" class="close-btn">✖</button>-->
<!--        </div>-->

<!--        <div class="table-container">-->
<!--            &lt;!&ndash; {{ memberList }} &ndash;&gt;-->
<!--            <table class="class-table">-->
<!--                <thead>-->
<!--                <tr>-->
<!--                    <th v-if="showSelectColumn" class="select-column">Select</th>-->
<!--                    <th class="username-column">Username</th>-->
<!--                    <th>-->
<!--                        <select class="role-option" v-model="roleFilter">-->
<!--                            <option value="Role">Role</option>-->
<!--                            <option value="ADMIN">ADMIN</option>-->
<!--                            <option value="MEMBER" selected>MEMBER</option>-->
<!--                        </select>-->
<!--                    </th>-->
<!--                </tr>-->
<!--                </thead>-->
<!--                <tbody>-->
<!--                    <tr v-for="(row, index) in memberList" :key="index">-->
<!--                        <td v-if="showSelectColumn">-->
<!--                            <input type="checkbox" @change="toggleSelectMember(row.userId)" :checked="selectedUsers.includes(row.userId)" />-->
<!--                        </td>-->
<!--                        <td class="username-column"><p>{{row.userName}}</p></td>-->
<!--                        <td class="role">-->
<!--                            <p v-if="!isDisplayRoleSetting">{{ row.role }}</p>-->
<!--                            &lt;!&ndash; Thay input bằng select &ndash;&gt;-->
<!--                            <select v-if="row.role&&isDisplayRoleSetting" class="role-option" v-model="row.role" @change="updateRole(row)">-->
<!--                                <option value="ADMIN">ADMIN</option>-->
<!--                                <option value="MEMBER" selected>MEMBER</option>-->
<!--                            </select>-->
<!--                        </td>-->
<!--                    </tr>-->
<!--                </tbody>-->
<!--            </table>-->
<!--        </div>-->

<!--        <div class="actions">-->
<!--            <button @click="toggleSelectColumn" class="icon-button">-->
<!--                <img src="../assets/select.svg" alt="" class="icon">-->
<!--            </button>-->
<!--            <button @click="removeRow" class="icon-button">-->
<!--                <img src="../assets/delete-word.svg" alt="" class="icon">-->
<!--            </button>-->
<!--            <button @click="openAddMember" class="icon-button">-->
<!--                <img src="../assets/add-word.svg" alt="" class="icon">-->
<!--            </button>-->
<!--            <button @click="handleSaveClassName" class="icon-button">-->
<!--                <img src="../assets/save.svg" alt="" class="icon">-->
<!--            </button>-->
<!--        </div>-->
<!--    </div>-->

<!--    <AddMember :setName="setName" v-if="showAddMember" @close="closeAddMember"></AddMember>-->
<!--</template>-->

<!--<style scoped>-->
<!--    .class-window {-->
<!--        position: fixed;-->
<!--        top: 100px;-->
<!--        left: 50%;-->
<!--        transform: translateX(-50%);-->
<!--        background-color: white;-->
<!--        border-radius: 8px;-->
<!--        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);-->
<!--        padding: 20px;-->
<!--        width: 40%;-->
<!--        z-index: 1000;-->
<!--    }-->

<!--    .class-header {-->
<!--        display: flex;-->
<!--        justify-content: space-between;-->
<!--        align-items: center;-->
<!--    }-->

<!--    .search-icon {-->
<!--        height: 20px;-->
<!--        cursor: pointer;-->
<!--    }-->

<!--    .search-icon:hover {-->
<!--        transform: scale(1.1);-->
<!--    }-->

<!--    .class-header img {-->
<!--        margin-left: 10px;-->
<!--    }-->

<!--    .class-header .search-bar {-->
<!--        margin-left: 10px;-->
<!--        padding: 5px;-->
<!--        border: 1px solid black;-->
<!--        border-radius: 4px;-->
<!--        text-align: center;-->
<!--        width: 50%;-->
<!--    }-->

<!--    .class-name {-->
<!--        display: flex;-->
<!--        align-items: center;-->
<!--        justify-content: center;-->
<!--        flex-grow: 1;-->
<!--    }-->

<!--    .class-name input {-->
<!--        margin-left: 10px;-->
<!--        padding: 5px;-->
<!--        border: 1px solid black;-->
<!--        border-radius: 4px;-->
<!--        text-align: center;-->
<!--        width: 50%;-->
<!--    }-->

<!--    .table-container {-->
<!--        max-height: 300px;-->
<!--        overflow-y: auto;-->
<!--        margin-top: 20px;-->
<!--        flex-grow: 1;-->
<!--        position: relative;-->
<!--    }-->

<!--    .class-table {-->
<!--        min-height: 70px;-->
<!--        width: 100%;-->
<!--        margin-top: 10px;-->
<!--        border-collapse: collapse; /* Bỏ khoảng cách giữa các cột */-->
<!--    }-->

<!--    .class-table thead th {-->
<!--        background-color: #A8D5E5;-->
<!--        border: 1px solid black;-->
<!--        position: sticky;-->
<!--        top: 0; /* Cố định hàng tiêu đề khi cuộn */-->
<!--        z-index: 1; /* Đảm bảo hàng tiêu đề luôn nằm trên cùng */-->
<!--    }-->

<!--    .class-table th {-->
<!--        padding: 5px;-->
<!--        border: 1px solid #ccc;-->
<!--        text-align: center;-->
<!--    }-->

<!--    .class-table th select {-->
<!--        background-color: #A8D5E5;-->
<!--        width: 80px;-->
<!--        border: none;-->
<!--    }-->

<!--    .class-table th option {-->
<!--        height: 25px;-->
<!--        background-color: #ffffff;-->
<!--    }-->

<!--    .class-table td {-->
<!--        padding: 5px;-->
<!--        border: 1px solid #ccc;-->
<!--        text-align: center;-->
<!--    }-->

<!--    .role-option {-->
<!--        width: 80px;-->
<!--        height: 25px;-->
<!--        cursor: pointer;-->
<!--    }-->

<!--    .select-column {-->
<!--        width: 50px; /* Chiều rộng cho cột Select */-->
<!--    }-->

<!--    .username-column {-->
<!--        width: 300px;-->
<!--    }-->

<!--    .username-column p {-->
<!--        text-align: left;-->
<!--        margin-left: 10px;-->
<!--    }-->

<!--    .actions {-->
<!--        display: flex;-->
<!--        justify-content: space-around; /* Căn giữa các icon */-->
<!--        margin: 5px;-->
<!--        margin-top: 15px;-->
<!--    }-->

<!--    .icon-button {-->
<!--        cursor: pointer;-->
<!--        width: 80px;-->
<!--        height: 40px;-->
<!--        display: flex;-->
<!--        align-items: center;-->
<!--        justify-content: center;-->
<!--        border: none;-->
<!--        background: none;-->
<!--        transition: background-color 0.3s;-->
<!--    }-->

<!--    .icon-button:hover {-->
<!--        transform: scale(1.05);-->
<!--    }-->

<!--    .icon {-->
<!--        width: 100%;-->
<!--        height: auto;-->
<!--        cursor: pointer;-->
<!--    }-->

<!--    .close-btn {-->
<!--        background: none;-->
<!--        border: none;-->
<!--        font-size: 20px;-->
<!--        cursor: pointer;-->
<!--    }-->

<!--    td.role p{-->
<!--      font-weight: bolder;-->
<!--    }-->


<!--</style>-->

<script setup>
import { ref, defineEmits, defineProps, onMounted } from 'vue';
import OverlayBackground from '../components/OverlayBackground.vue';
import AddMember from './AddMember.vue';
import { createClass, updateClassName, getMemberList, deleteMember, updateMemberRole } from '@/apis/classApi';
import { getCurrentUser } from '@/apis/userApi';

const emit = defineEmits(['close', 'save', 'reload']);
const props = defineProps(['isEditMode']);

const visible = ref(true);
const className = ref(props.isEditMode ? localStorage.getItem('className') || '' : '');
const memberList = ref([]);
const selectedUsers = ref([]);
const showSelectColumn = ref(false);
const showAddMember = ref(false);
const classId = ref(null);
const token = localStorage.getItem('token');
const isDisplayRoleSetting = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// Pagination variables
const membersPage = ref(0);
const membersSize = ref(10);
const membersTotalPages = ref(0);
const membersTotalElements = ref(0);

const saveClassName = async () => {
  if (!className.value.trim()) {
    alert('Class name cannot be empty!');
    return;
  }

  const payload = {
    classId: props.isEditMode ? localStorage.getItem('classId') : null,
    name: className.value,
  };
  try {
    isLoading.value = true;
    let response;
    if (props.isEditMode) {
      response = await updateClassName(payload, token);
      alert('Class updated successfully.');
      localStorage.setItem('className', className.value);
      emit('reload');
      await getMember();
      isDisplayRoleSetting.value = true;
    } else {
      response = await createClass(payload, token);
      classId.value = response.classId;
      localStorage.setItem('classId', classId.value);
      localStorage.setItem('className', className.value);
      emit('save', response);
      emit('reload');
      await getMember();
      isDisplayRoleSetting.value = true;
    }
  } catch (error) {
    console.error('Error saving class:', error);
    alert('Failed to save class: ' + (error.message || 'Unknown error'));
  } finally {
    isLoading.value = false;
  }
};

const removeRow = async () => {
  if (selectedUsers.value.length === 0) {
    alert('Please select at least one member to remove.');
    return;
  }

  const classId = localStorage.getItem('classId');
  if (!classId) {
    alert('Class ID is missing. Please try again.');
    return;
  }

  try {
    isLoading.value = true;
    for (const userId of selectedUsers.value) {
      await deleteMember(userId, classId, token);
    }
    alert('Members removed successfully.');
    selectedUsers.value = [];
    await getMember();
    emit('reload');
  } catch (error) {
    console.error('Error removing members:', error);
    alert('Failed to remove members: ' + (error || 'Unknown error'));
  } finally {
    isLoading.value = false;
  }
};

const closeForm = () => {
  emit('close');
  visible.value = false;
};

const toggleSelectMember = (userId) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index === -1) {
    selectedUsers.value.push(userId);
  } else {
    selectedUsers.splice(index, 1);
  }
};

const toggleSelectColumn = () => {
  showSelectColumn.value = !showSelectColumn.value;
};

const openAddMember = () => {
  showAddMember.value = true;
  visible.value = false;
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
    isLoading.value = true;
    await updateMemberRole(payload, token);
    alert('Role updated successfully.');
  } catch (error) {
    console.error('Error updating role:', error);
    user.role = user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    alert('Failed to update role: ' + (error || 'Unknown error'));
  } finally {
    isLoading.value = false;
  }
};

const getMember = async () => {
  if (!classId.value) {
    console.warn('No classId provided');
    errorMessage.value = 'Class ID is missing.';
    memberList.value = [];
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';
    const response = await getMemberList(classId.value, token, membersPage.value, membersSize.value);
    console.log('API response:', response);
    memberList.value = Array.isArray(response.memberList) ? response.memberList : [];
    membersTotalPages.value = Number(response.totalPages) || 0;
    membersTotalElements.value = Number(response.totalElements) || 0;
    console.log('Assigned memberList:', memberList.value);
  } catch (error) {
    console.error('Error fetching members:', error);
    errorMessage.value = 'Failed to load members: ' + (error.message || 'Unknown error');
    memberList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const changeMembersPage = (newPage) => {
  if (newPage >= 0 && newPage < membersTotalPages.value && !isLoading.value) {
    membersPage.value = newPage;
    getMember();
  }
};

const getPageNumbers = () => {
  const maxPagesToShow = 5;
  const totalPages = membersTotalPages.value;
  const currentPage = membersPage.value;
  const pageNumbers = [];

  const startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow);

  for (let i = startPage; i < endPage; i++) {
    pageNumbers.push(i);
  }
  return pageNumbers;
};

onMounted(async () => {
  if (props.isEditMode) {
    classId.value = localStorage.getItem('classId');
    className.value = localStorage.getItem('className') || '';
    if (!classId.value) {
      console.warn('No classId found in localStorage');
      errorMessage.value = 'Class ID not found. Please try again.';
      return;
    }
    await getMember();
    if (memberList.value.length > 0) {
      try {
        const currentUser = await getCurrentUser(token);
        isDisplayRoleSetting.value = memberList.value.some(
            member => member.role === 'ADMIN' && member.userName === currentUser.username
        );
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    }
  }
});
</script>

<template>
  <OverlayBackground :isVisible="visible" @clickOverlay="closeForm" />
  <div v-if="visible" class="class-window">
    <div class="class-header">
      <div class="class-name">
        <label for="class-name">Class:</label>
        <input id="class-name" v-model="className" placeholder="Enter class name" />
      </div>
      <button @click="closeForm" class="close-btn">✖</button>
    </div>

    <div class="table-container">
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="isLoading" class="loading">Loading...</div>
      <table v-else class="class-table">
        <thead>
        <tr>
          <th v-if="showSelectColumn" class="select-column">Select</th>
          <th class="username-column">Username</th>
          <th class="role-column">Role</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in memberList" :key="row.userId">
          <td v-if="showSelectColumn">
            <input type="checkbox" @change="toggleSelectMember(row.userId)" :checked="selectedUsers.includes(row.userId)" />
          </td>
          <td class="username-column"><p>{{ row.userName }}</p></td>
          <td class="role">
            <p v-if="!isDisplayRoleSetting">{{ row.role }}</p>
            <select v-if="isDisplayRoleSetting" class="role-option" v-model="row.role" @change="updateRole(row)">
              <option value="ADMIN">ADMIN</option>
              <option value="MEMBER">MEMBER</option>
            </select>
          </td>
        </tr>
        <tr v-if="memberList.length === 0 && !isLoading && !errorMessage">
          <td :colspan="showSelectColumn ? 3 : 2">No members found.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="membersTotalPages > 1" class="pagination">
      <div class="pagination-info">
        Page {{ membersPage + 1 }} of {{ membersTotalPages }}
        (Total {{ membersTotalElements }} members)
      </div>
      <div class="pagination-controls">
        <button
            class="pagination-btn"
            @click="changeMembersPage(0)"
            :disabled="membersPage === 0 || isLoading"
        >
          First
        </button>
        <button
            class="pagination-btn"
            @click="changeMembersPage(membersPage - 1)"
            :disabled="membersPage === 0 || isLoading"
        >
          Prev
        </button>
        <button
            v-for="pageNum in getPageNumbers()"
            :key="pageNum"
            class="page-number-btn"
            :class="{ active: pageNum === membersPage }"
            @click="changeMembersPage(pageNum)"
            :disabled="isLoading"
        >
          {{ pageNum + 1 }}
        </button>
        <button
            class="pagination-btn"
            @click="changeMembersPage(membersPage + 1)"
            :disabled="membersPage >= membersTotalPages - 1 || isLoading"
        >
          Next
        </button>
        <button
            class="pagination-btn"
            @click="changeMembersPage(membersTotalPages - 1)"
            :disabled="membersPage >= membersTotalPages - 1 || isLoading"
        >
          Last
        </button>
      </div>
    </div>

    <div class="actions">
      <button @click="toggleSelectColumn" class="icon-button">
        <img src="../assets/select.svg" alt="Select" class="icon">
      </button>
      <button @click="removeRow" class="icon-button">
        <img src="../assets/delete-word.svg" alt="Delete" class="icon">
      </button>
      <button @click="openAddMember" class="icon-button">
        <img src="../assets/add-word.svg" alt="Add" class="icon">
      </button>
      <button @click="saveClassName" class="icon-button">
        <img src="../assets/save.svg" alt="Save" class="icon">
      </button>
    </div>
  </div>

  <AddMember :setName="className" v-if="showAddMember" @close="closeAddMember" />
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
  position: relative;
}

.class-table {
  width: 100%;
  border-collapse: collapse;
}

.class-table thead th {
  background-color: #A8D5E5;
  border: 1px solid black;
  position: sticky;
  top: 0;
  z-index: 1;
}

.class-table th, .class-table td {
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
  width: 50px;
}

.username-column {
  width: 300px;
}

.role-column {
  width: 100px;
}

.username-column p {
  text-align: left;
  margin-left: 10px;
}

.actions {
  display: flex;
  justify-content: space-around;
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
  transition: transform 0.3s;
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

td.role p {
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 10px;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 10px;
  color: #d32f2f;
  font-weight: bold;
}

/* Pagination Styles */
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  user-select: none;
}

.pagination-info {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-btn, .page-number-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover, .page-number-btn:hover {
  background-color: #e0e0e0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number-btn.active {
  background-color: black;
  color: white;
}
</style>