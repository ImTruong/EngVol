<script setup>
import { ref, watch, defineEmits, defineProps, computed, onMounted } from 'vue';
// Import các component con sẽ sử dụng trong component này
import OverlayBackground from '../components/OverlayBackground.vue';
import ModifyCardModal from '../components/ModifyCardModal.vue';
import ImageCard from './ImageCard.vue';
// Import các hàm API gọi backend
import { saveSetInfo } from '@/apis/setApi';
import { deleteWord } from '@/apis/wordApi';
import { getCurrentUserClasses } from '@/apis/classApi';

// Khai báo event emit để phát sự kiện ra component cha
const emit = defineEmits(['close', 'reload']);

// Khai báo props nhận vào từ component cha
const props = defineProps(['isEditMode', 'existingSet', 'classId', 'className', 'inClass']);

// State quản lý hiển thị form
const visible = ref(true);

// Tên bộ từ vựng, nếu là chỉnh sửa sẽ lấy tên của existingSet
const setName = ref(props.isEditMode ? props.existingSet.name : '');

// Danh sách các từ (wordResponses) trong bộ từ, hoặc khởi tạo mới với 1 row trống
const rows = ref(props.isEditMode ? props.existingSet.wordResponses : [{ id: '', word: '', ipa: '', audio: '', definition: '', example: '', image: '' }]);

// Danh sách các từ được chọn (đánh dấu checkbox)
const selectedWords = ref([]);

// Biến để hiện cột checkbox chọn từ
const showSelectColumn = ref(false);

// Biến để hiện/ẩn menu chọn quyền riêng tư
const showOptions = ref(false);

// Lựa chọn quyền riêng tư (Class, Private,...)
const selectedOption = ref(props.isEditMode ? props.existingSet.privacyStatus : (props.inClass ? 'CLASS' : 'PRIVATE'));

// Ref cho dropdown menu (dùng khi cần thao tác trực tiếp DOM)
const dropdownRef = ref(null);

// Biến trạng thái đang chỉnh sửa 1 từ
const isEditWord = ref(false);

// Biến để hiện modal sửa thẻ từ
const showModifyCardModal = ref(false);

// Lưu classId (nếu bộ từ thuộc class)
const classId = ref((props.isEditMode && props.existingSet.privacyStatus === 'CLASS') || props.inClass ? props.classId : '');

// Quản lý trạng thái hiển thị ô tìm kiếm
const isSearchVisible = ref(false);

// Từ khóa tìm kiếm
const searchTerm = ref('');

// Từ đang chỉnh sửa (khi mở modal sửa)
const editWord = ref(null);

// Danh sách các lớp của người dùng
const myClasses = ref([]);

// Lớp được chọn hiện tại (nếu thuộc quyền riêng tư class)
const selectedClass = ref(props.isEditMode && props.existingSet.privacyStatus === 'CLASS' ?
    { classId: props.classId, className: props.className } :
    (props.inClass ? { classId: props.classId, className: props.className } : null)
);

// Lấy thông tin user từ localStorage
const user = JSON.parse(localStorage.getItem('user'));

// Biến hiển thị modal xem ảnh
const showImg = ref(false);

// URL ảnh đang xem
const image = ref("");

// Token xác thực lấy từ localStorage
const token = localStorage.getItem('token');

// Biến phân trang (page, size) khi lấy dữ liệu
const page = ref(0);
const size = ref(12);

// Các biến phục vụ cho modal chọn class
const showClassModal = ref(false);
const previousSelectedOption = ref(selectedOption.value); // lưu trạng thái option trước khi mở modal chọn class
const previousSelectedClass = ref(selectedClass.value);   // lưu trạng thái class trước khi mở modal chọn class

// Biến tìm kiếm và phân trang class trong modal
const classSearchTerm = ref('');
const classPage = ref(0);
const classSize = ref(10);
const classLoading = ref(false);
const classHasMore = ref(true);

// Ref DOM container scroll của modal class (dùng để xử lý infinite scroll)
const classModalScrollContainer = ref(null);

// Biến kiểm tra bộ từ đã được tạo (để phân biệt tạo mới hay chỉnh sửa)
const isSetCreated = ref(props.isEditMode);

// Lưu id của bộ từ hiện tại (có thể mới tạo hoặc đã có)
const currentSetId = ref(props.isEditMode && props.existingSet ? props.existingSet.id : null);

// Khi component mounted, gọi API lấy danh sách lớp của user lần đầu
onMounted(async() => {
  myClasses.value = await getCurrentUserClasses(token, page.value, size.value);
});

// Hàm tải danh sách lớp cho modal, có thể reset lại danh sách
const loadClasses = async (reset = false) => {
  if (classLoading.value) return; // nếu đang load thì không gọi lại

  classLoading.value = true;
  try {
    const currentPage = reset ? 0 : classPage.value;
    // Gọi API lấy lớp, có tìm kiếm và phân trang
    const response = await getCurrentUserClasses(token, currentPage, classSize.value, classSearchTerm.value);

    if (reset) {
      // Nếu reset thì gán lại toàn bộ dữ liệu lớp
      myClasses.value = response.content || [];
      classPage.value = 0;
    } else {
      // Nếu không reset thì nối thêm dữ liệu mới vào danh sách hiện tại
      myClasses.value = [...myClasses.value, ...(response.content || [])];
    }

    // Kiểm tra xem còn trang tiếp theo không
    classHasMore.value = !response.last;
    if (classHasMore.value) {
      classPage.value++;
    }
  } catch (error) {
    console.error('Error loading classes:', error);
  } finally {
    classLoading.value = false;
  }
};

// Hàm xử lý tìm kiếm lớp: reset phân trang và gọi load lại
const searchClasses = async () => {
  classPage.value = 0;
  classHasMore.value = true;
  await loadClasses(true);
};

// Hàm xử lý scroll trong modal class để load thêm dữ liệu (infinite scroll)
const handleClassScroll = async () => {
  if (!classModalScrollContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = classModalScrollContainer.value;
  const threshold = 50; // ngưỡng cách đáy 50px để load thêm

  if (scrollTop + clientHeight >= scrollHeight - threshold && classHasMore.value && !classLoading.value) {
    await loadClasses();
  }
};

// Hàm lưu thông tin bộ từ (tạo mới hoặc cập nhật)
const saveSetInfoInfo = async () => {
  showOptions.value = false;
  const payload = {
    setId: currentSetId.value || (props.isEditMode ? props.existingSet.id : null),
    name: setName.value,
    description: "My set",
    privacyStatus: selectedOption.value,
    classId: classId.value || null
  };
  try {
    // Gọi API lưu bộ từ
    const response = await saveSetInfo(payload, token, isSetCreated.value);
    console.log(response)
    emit("reload"); // phát sự kiện yêu cầu load lại dữ liệu cha
    alert(response.message);
    setName.value = response.data.name;
    currentSetId.value = response.data.id;
    // Cập nhật trạng thái bộ từ đã được tạo thành công
    isSetCreated.value = true;
  } catch (error) {
    alert(error);
    console.log(error);
  }
};

// Hàm thêm từ mới vào danh sách rows
const addNewWord = (newWord) => {
  rows.value.push(newWord);
  emit("reload"); // yêu cầu reload dữ liệu
};

// Hàm xóa các từ được chọn
const removeRow = async () => {
  if (selectedWords.value.length > 0) {
    for (const wordId of selectedWords.value) {
      try {
        const token = localStorage.getItem('token');
        // Gọi API xóa từ
        const response = await deleteWord(wordId, token);
        // Lọc lại danh sách từ sau khi xóa
        rows.value = rows.value.filter(row => row.id !== wordId);
        alert(response.message);
      } catch (error) {
        alert(error);
        console.log(error);
      }
    }
    selectedWords.value = [];
  }
  emit('update', rows.value);
  emit("reload");
};

// Hàm đóng form, phát sự kiện cho component cha
const closeForm = () => {
  emit('close');
  visible.value = false;
};

// Chọn hoặc bỏ chọn 1 từ trong danh sách
const toggleSelectWord = (row) => {
  const index = selectedWords.value.indexOf(row.id);
  if (index === -1) {
    selectedWords.value.push(row.id);
  } else {
    selectedWords.value.splice(index, 1);
  }
};

// Bật/tắt hiển thị cột checkbox chọn từ
const toggleSelectColumn = () => {
  showOptions.value = false;
  showSelectColumn.value = !showSelectColumn.value;
};

// Bật/tắt hiển thị menu chọn quyền riêng tư
const toggleOptions = () => {
  showOptions.value = !showOptions.value;
};

// Xử lý khi chọn quyền riêng tư trong menu
const selectOption = (option) => {
  if (option === 'CLASS') {
    // Lưu trạng thái hiện tại trước khi mở modal chọn lớp
    previousSelectedOption.value = selectedOption.value;
    previousSelectedClass.value = selectedClass.value;
    showClassModal.value = true;
    showOptions.value = false;
    // Tải danh sách lớp khi mở modal
    loadClasses(true);
  } else {
    // Nếu chọn quyền riêng tư khác CLASS thì reset class đã chọn
    selectedOption.value = option;
    selectedClass.value = null;
    classId.value = '';
    showOptions.value = false;
  }
};

// Xử lý khi chọn 1 class trong modal
const selectClassFromModal = (classItem) => {
  selectedOption.value = 'CLASS';
  selectedClass.value = classItem;
  classId.value = classItem.classId;
  showClassModal.value = false;
};

// Xử lý đóng modal chọn class mà không chọn class nào
const closeClassModal = () => {
  // Khôi phục lại lựa chọn trước đó
  selectedOption.value = previousSelectedOption.value;
  selectedClass.value = previousSelectedClass.value;
  if (previousSelectedClass.value) {
    classId.value = previousSelectedClass.value.classId;
  } else {
    classId.value = '';
  }
  showClassModal.value = false;

  // Reset tìm kiếm và phân trang
  classSearchTerm.value = '';
  classPage.value = 0;
  classHasMore.value = true;
};

// Mở modal sửa từ mới, kiểm tra đã lưu set chưa
const openModifyCardModal = () => {
  showOptions.value = false;
  if (!isSetCreated.value && !setName.value) {
    alert("Save set before add words.");
    return;
  }
  showModifyCardModal.value = true;
  visible.value = false;
};

// Đóng modal sửa từ
const closeModifyCardModal = () => {
  isEditWord.value = false;
  visible.value = true;
  showModifyCardModal.value = false;
};

// Hàm kiểm tra và gọi lưu set
const handleSaveSetInfoInfo = () => {
  if (setName.value.trim()) {
    if (selectedOption.value === 'CLASS' && !classId.value) {
      alert('Please select a class');
      return;
    }
    saveSetInfoInfo();
  } else {
    alert("Please enter setname");
  }
};

// Bật/tắt ô tìm kiếm
const toggleSearch = () => {
  showOptions.value = false;
  isSearchVisible.value = !isSearchVisible.value;
};

// Hàm mở chỉnh sửa từ, set state để modal chỉnh sửa biết
const EditRow = (row) => {
  isEditWord.value = true;
  editWord.value = row;
  openModifyCardModal();
};

// Computed lọc danh sách từ dựa vào từ khóa tìm kiếm
const filteredRows = computed(() => {
  if (!isSearchVisible.value || !searchTerm.value.trim()) {
    return rows.value;
  }
  // Lọc các từ có chứa từ khóa tìm kiếm, không phân biệt hoa thường
  return rows.value.filter(row => row.word.toLowerCase().includes(searchTerm.value.toLowerCase().trim()));
});

// Hàm cập nhật lại 1 từ khi sửa xong
const updateWord = (updatedWord) => {
  const index = rows.value.findIndex(row => row.id === updatedWord.id);
  if (index !== -1) {
    rows.value[index] = updatedWord;
  } else {
    console.error('Word not found in rows');
  }
  emit('update', rows.value);
  emit("reload");
};

// Watch props.existingSet để khi có dữ liệu mới từ component cha thì cập nhật lại các biến local
watch(() => props.existingSet, (newExistingSet) => {
  if (newExistingSet && newExistingSet.words) {
    setName.value = newExistingSet.name;
    rows.value = newExistingSet.words;
    selectedOption.value = newExistingSet.privacyStatus || '';
    classId.value = newExistingSet.privacyStatus === 'CLASS' ? props.classId : '';

    // Cập nhật trạng thái bộ từ đã được tạo
    isSetCreated.value = true;
    currentSetId.value = newExistingSet.id;
  }
}, { immediate: true });

const openImage = (img) => {
  showImg.value = true;
  image.value = img;
  visible.value = false;
};

const closeImage = () => {
  showImg.value = false;
  visible.value = true;
};
</script>

<template>
  <OverlayBackground :isVisible="visible" @clickOverlay="closeForm" />
  <div v-if="visible" class="set-window">
    <div class="set-header">
      <img src="../assets/lock.svg" alt="Status" @click.stop="toggleOptions" class="option-icon">
      <img src="../assets/search_icon.svg" alt="Search" @click.stop="toggleSearch" class="option-icon">
      <div v-show="isSearchVisible">
        <input v-model="searchTerm" placeholder="Search for a word" class="common-input" />
      </div>
      <div class="set-name">
        <label for="set-name">Set:</label>
        <input id="set-name" v-model="setName" placeholder="Enter set name" class="common-input"/>
      </div>
      <button @click="closeForm" class="close-btn">✖</button>
    </div>
    <div v-show="showOptions" class="options-dropdown" ref="dropdownRef">
      <button @click.stop="selectOption('PUBLIC')" class="option-button">
        <img src="../assets/globe.svg" alt="Public" class="option-icon" />
        <span class="option-text">Public</span>
        <span v-if="selectedOption === 'PUBLIC'" class="checkmark">✔</span>
      </button>
      <button @click.stop="selectOption('PRIVATE')" class="option-button">
        <img src="../assets/lock.svg" alt="Private" class="option-icon" />
        <span class="option-text">Private</span>
        <span v-if="selectedOption === 'PRIVATE'" class="checkmark">✔</span>
      </button>
      <button @click.stop="selectOption('CLASS')" class="option-button">
        <img src="../assets/lock.svg" alt="class" class="option-icon" />
        <span class="option-text">Class</span>
        <span v-if="selectedOption === 'CLASS'" class="checkmark">✔</span>
        <span v-if="selectedOption === 'CLASS' && selectedClass" class="selected-class">
                    ({{ selectedClass.className }})
                </span>
      </button>
    </div>
    <div class="table-container">
      <table class="set-table">
        <thead>
        <tr>
          <th v-if="showSelectColumn" class="select-column">Select</th>
          <th>Word</th>
          <th>IPA</th>
          <th>Definition</th>
          <th>Example</th>
          <th class="image">Image</th>
          <th class="edit" >Edit</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row, index) in filteredRows" :key="index">
          <td v-if="showSelectColumn">
            <input type="checkbox" @change="toggleSelectWord(row)" :checked="selectedWords.includes(row.id)" />
          </td>
          <td><p>{{ row.word }}</p></td>
          <td><p>{{ row.ipa }}</p></td>
          <td><p>{{ row.definition }}</p></td>
          <td><p>{{ row.example }}</p></td>
          <td class="image" >
            <img v-if="row.image" src="../assets/image.svg" alt="class" class="image-icon" @click="openImage(row.image)" />
          </td>
          <td v-if="row.word">
            <img  src="../assets/edit-02.svg" alt="" @click="EditRow(row)" class="edit-icon">
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
      <button @click="openModifyCardModal" class="icon-button">
        <img src="../assets/add-word.svg" alt="" class="icon">
      </button>
      <button @click="handleSaveSetInfoInfo" class="icon-button">
        <img src="../assets/save.svg" alt="" class="icon">
      </button>
    </div>
  </div>

  <!-- Class Selection Modal -->
  <OverlayBackground :isVisible="showClassModal" @clickOverlay="closeClassModal" />
  <div v-if="showClassModal" class="class-modal">
    <div class="class-modal-header">
      <h3>Select a Class</h3>
      <button @click="closeClassModal" class="close-btn">✖</button>
    </div>

    <!-- Search Section -->
    <div class="class-search-section">
      <div class="search-input-container">
        <input
            v-model="classSearchTerm"
            @input="searchClasses"
            @keyup.enter="searchClasses"
            type="text"
            placeholder="Search classes..."
            class="class-search-input"
        />
        <button @click="searchClasses" class="search-btn" :disabled="classLoading">
          <img src="../assets/search_icon.svg" alt="Search" class="search-icon" />
        </button>
      </div>
    </div>

    <div class="class-modal-content" ref="classModalScrollContainer" @scroll="handleClassScroll">
      <div v-if="classLoading && myClasses.length === 0" class="loading-state">
        <p>Loading classes...</p>
      </div>
      <div v-else-if="myClasses.length === 0" class="no-classes">
        <p>{{ classSearchTerm ? 'No classes found matching your search' : 'No classes available' }}</p>
      </div>
      <div v-else class="class-list">
        <div
            v-for="classItem in myClasses"
            :key="classItem.classId"
            @click="selectClassFromModal(classItem)"
            class="class-item"
            :class="{ 'selected': selectedClass && selectedClass.classId === classItem.classId }"
        >
          <div class="class-info">
            <h4>{{ classItem.className }}</h4>
            <div class="class-stats">
                            <span class="stat-item">
                                <img src="../assets/user.svg" alt="Members" class="stat-icon" />
                                {{ classItem.numberOfMembers || 0 }} members
                            </span>
              <span class="stat-item">
                                <img src="../assets/new-set.svg" alt="Sets" class="stat-icon" />
                                {{ classItem.numberOfSets || 0 }} sets
                            </span>
            </div>
          </div>
        </div>

        <!-- Loading more indicator -->
        <div v-if="classLoading && myClasses.length > 0" class="loading-more">
          <p>Loading more classes...</p>
        </div>

        <!-- End of results indicator -->
        <div v-if="!classHasMore && myClasses.length > 0" class="end-of-results">
          <p>No more classes to load</p>
        </div>
      </div>
    </div>
    <div class="class-modal-footer">
      <button @click="closeClassModal" class="cancel-btn">Cancel</button>
    </div>
  </div>

  <ModifyCardModal
      :setName="setName"
      :setId="currentSetId"
      :word="isEditWord ? editWord : null"
      v-if="showModifyCardModal"
      @update="updateWord"
      @close="closeModifyCardModal"
      @save="addNewWord">
  </ModifyCardModal>
  <ImageCard :Overlay_background ="showImg" :image="image" v-if="showImg" @close="closeImage"></ImageCard>
</template>

<style scoped>
.set-window {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 60%;
  z-index: 11;
}

.set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.set-header img {
  margin-left: 10px;
}

.set-name {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
}

.common-input {
  margin-left: 10px;
  padding: 5px;
  border: 1px solid black;
  border-radius: 4px;
  text-align: center;
  width: 50%;
  min-width: 150px;
  max-width: 300px;
}

.table-container {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 20px;
  flex-grow: 1;
  position: relative;
}

.set-table {
  width: 100%;
  min-height: 60px;
  margin-top: 20px;
  border-collapse: collapse;
  table-layout: fixed;
}

.set-table th {
  background-color: #A8D5E5;
  border: 1px solid black;
}

.set-table td {
  padding: 5px;
  border: 1px solid #ccc;
  text-align: center;
}

.select-column {
  width: 50px;
}

.image {
  width: 50px !important;
}

.image-icon:hover {
  transform: scale(1.05);
}

.edit {
  width: 50px;
}

.edit-icon:hover {
  transform: scale(1.05);
}

.set-table td img {
  width: 20px;
  height: auto;
  cursor: pointer;
}

.set-table th:not(.select-column, .edit) {
  width: calc((100% - 20px) / 5);
}

.actions {
  display: flex;
  justify-content: space-around;
  margin: 5px;
  margin-bottom: 0px;
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

.icon {
  width: 100%;
  height: auto;
  cursor: pointer;
}

.icon:hover {
  transform: scale(1.05);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.options-dropdown {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  z-index: 1001;
}

.option-button {
  display: flex;
  align-items: center;
  padding: 10px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.option-button:hover {
  background-color: #f0f0f0;
}

.option-icon {
  width: 20px;
  height: 20px;
  margin-right: 15px;
  cursor: pointer;
}

.checkmark {
  color:rgb(218, 87, 87);
  margin-left: 15px;
}

.selected-class {
  color: #666;
  font-size: 12px;
  margin-left: 5px;
}

/* Class Modal Styles */
.class-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 600px;
  max-height: 700px;
  z-index: 1002;
  display: flex;
  flex-direction: column;
}

.class-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.class-modal-header h3 {
  margin: 0;
  color: #333;
}

.class-search-section {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.search-input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.class-search-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.class-search-input:focus {
  border-color: #A8D5E5;
}

.search-btn {
  padding: 10px;
  background-color: #A8D5E5;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  width: 40px;
  height: 40px;
}

.search-btn:hover:not(:disabled) {
  background-color: #91c7d9;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-icon {
  width: 18px;
  height: 18px;
}

.class-modal-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: 450px;
}

.loading-state, .no-classes {
  text-align: center;
  color: #666;
  padding: 40px 20px;
}

.loading-more {
  text-align: center;
  color: #666;
  padding: 20px;
  font-style: italic;
}

.end-of-results {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: 10px;
}

.class-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.class-item {
  padding: 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fff;
}

.class-item:hover {
  border-color: #A8D5E5;
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.class-item.selected {
  border-color: #A8D5E5;
  background-color: #e7f3ff;
  box-shadow: 0 2px 8px rgba(168, 213, 229, 0.3);
}

.class-info h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.class-stats {
  display: flex;
  gap: 20px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.stat-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.class-modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background-color: #f8f9fa;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}
</style>