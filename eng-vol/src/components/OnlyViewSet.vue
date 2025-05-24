<script setup>
import { ref, defineEmits, defineProps, computed, onMounted } from 'vue';
import OverlayBackground from '../components/OverlayBackground.vue';
import ImageCard from './ImageCard.vue';
import { getSetByRequestId, acceptSetRequest, rejectSetRequest } from '@/apis/setApi';

const emit = defineEmits(['close']);
const { requestId } = defineProps(['requestId']);
const existingSet = ref('');
const visible = ref(true);
const setName = ref('');
const rows = ref([]);
const showOptions = ref(false);
const selectedOption = ref('');
const dropdownRef = ref(null);
const classId = ref('');
const isSearchVisible = ref(false);
const searchTerm = ref('');
const showImg = ref(false);
const image = ref("");

const closeForm = () => {
  visible.value = false;
  emit('close');
};

const fetchSetById = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await getSetByRequestId(requestId, token);
    existingSet.value = response.data;
    setName.value = existingSet.value.name || '';
    rows.value = existingSet.value.wordResponses || [];
    selectedOption.value = existingSet.value.privacyStatus || '';
  } catch (error) {
    alert(error)
  }
};

const acceptAction = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await acceptSetRequest(requestId, token);
    alert(response.message);
    closeForm();
  } catch (error) {
    alert(error)
  }
};

const rejectAction = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await rejectSetRequest(requestId, token);
    alert(response.message);
    closeForm();
  } catch (error) {
    alert(error)
  }
};

const toggleOptions = () => {
  showOptions.value = !showOptions.value;
};

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
};

const filteredRows = computed(() => {
  if (!isSearchVisible.value || !searchTerm.value.trim()) {
    return rows.value;
  }
  return rows.value.filter(row => row.word.toLowerCase().includes(searchTerm.value.toLowerCase().trim()));
});

const openImage = (img) => {
  showImg.value = true;
  image.value = img;
  visible.value = false;
};

const closeImage = () => {
  showImg.value = false;
  visible.value = true;
};

onMounted(() => {
  fetchSetById();
});
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
        <input id="set-name" v-model="setName" placeholder="Enter set name" class="common-input" readonly/>
      </div>
      <button @click="closeForm" class="close-btn">✖</button>
    </div>
    <div v-show="showOptions" class="options-dropdown" ref="dropdownRef">
      <div class="option-button">
        <img src="../assets/globe.svg" alt="Public" class="option-icon" />
        <span class="option-text">Public</span>
        <span v-if="selectedOption === 'PUBLIC'" class="checkmark">✔</span>
      </div>
      <div class="option-button">
        <img src="../assets/lock.svg" alt="Private" class="option-icon" />
        <span class="option-text">Private</span>
        <span v-if="selectedOption === 'PRIVATE'" class="checkmark">✔</span>
      </div>
      <div class="option-button">
        <img src="../assets/lock.svg" alt="Class" class="option-icon" />
        <span class="option-text">Class</span>
        <span v-if="selectedOption === 'CLASS'" class="checkmark">✔</span>
      </div>
    </div>

    <div class="table-container">
      <table class="set-table">
        <thead>
        <tr>
          <th>Word</th>
          <th>IPA</th>
          <th>Definition</th>
          <th>Example</th>
          <th class="image">Image</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row, index) in filteredRows" :key="index">
          <td><p>{{ row.word }}</p></td>
          <td><p>{{ row.ipa }}</p></td>
          <td><p>{{ row.definition }}</p></td>
          <td><p>{{ row.example }}</p></td>
          <td class="image">
            <img v-if="row.image" src="../assets/image.svg" alt="image" class="image-icon" @click="openImage(row.image)" />
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="button">
      <div class="accept-button" @click="acceptAction">
        <p>Accept</p>
      </div>
      <div class="reject-button" @click="rejectAction">
        <p>Reject</p>
      </div>
    </div>
  </div>
  <ImageCard :Overlay_background="showImg" :image="image" v-if="showImg" @close="closeImage"></ImageCard>
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
  z-index: 26;
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

.set-table td p {
  margin: 0;
  padding: 5px;
}

.image {
  width: 50px !important;
}

.image-icon {
  width: 20px;
  height: auto;
  cursor: pointer;
}

.image-icon:hover {
  transform: scale(1.05);
}

.set-table th:not(.image) {
  width: calc((100% - 50px) / 4);
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
  color: rgb(218, 87, 87);
  margin-left: 15px;
}

.button {
  display: flex;
  text-align: center;
  flex-direction: row;
  align-items: center;
  gap: 0px;
  justify-content: space-around;
  padding-top: 10px;
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