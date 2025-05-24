<script setup>
  import { ref, defineEmits, defineProps, watch, onMounted } from 'vue';
  import { fetchWordAutomationData, createWord, updateWord } from '@/apis/wordApi.js';
  import OverlayBackground from '../components/OverlayBackground.vue';
  import ImageCard from './ImageCard.vue';

  const emit = defineEmits(['close', 'save', 'update']);
  const visible = ref(true);
  const definitions = ref([]);
  const isDropdownOpen= ref(false);
  const showImg = ref(false);
  const token = localStorage.getItem('token');
  const props = defineProps({
    setName: {
      type: String,
      default: ''
    },
    setId: {
      type: Number,
      default: null
    }, 
    word:{
      type: Object,
      default: null
    }
  });

  const newWord = ref({
    id: '',
    word: '',
    ipa: '',
    audio: '',
    definition: '',
    example: '',
    image: ''
  });

  const audioCache = ref({});
  let data = ref(null);

  const closeForm = () => {
    emit('close');
    visible.value = false;
  };
  
  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      newWord.value.image = event.target.files[0];
    } else {
      alert('No file selected');
    }
  };

  const setWordAutoData = async (word) => {
    word = newWord.value.word.trim();
    if (!word) return;
    data = await fetchWordAutomationData(word);
    if (data && data[0]?.phonetics) {
      const phonetic = data[0].phonetics.find(p => p.audio);
      newWord.value.ipa = phonetic?.text || '';
      newWord.value.audio = phonetic?.audio || '';

      const audioElement = document.getElementById('audio');
      if (phonetic?.audio) {
        audioElement.src = phonetic.audio;
        audioElement.style.display = "block";
        audioElement.play();
      } else {
        audioElement.style.display = "none";
      }
    }
    definitions.value = data[0]?.meanings?.flatMap(meaning =>
      meaning.definitions?.map(def => def.definition) || []
    )
  };

  onMounted (() => {
    if (props.word) {
      setWordAutoData(props.word);
    }
  });

  const saveData = async () => {
    // Validate required fields
    if (!props.setId) {
      alert("Set ID is required");
      return;
    }

    if (!newWord.value.word || newWord.value.word.trim() === '') {
      alert("Word is required");
      return;
    }

    if (!newWord.value.definition || newWord.value.definition.trim() === '') {
      alert("Definition is required");
      return;
    }

    const formData = new FormData();
    formData.append('setId', props.setId);
    if (newWord.value.id) formData.append('id', newWord.value.id);
    formData.append('word', newWord.value.word.trim());
    formData.append('ipa', newWord.value.ipa || '');
    formData.append('definition', newWord.value.definition.trim());
    formData.append('example', newWord.value.example || '');

    // Xử lý audio - chỉ gửi string URL, không gửi file
    if (newWord.value.audio) {
      if (typeof newWord.value.audio === 'string') {
        // Gửi trực tiếp string URL
        formData.append('audio', newWord.value.audio);
      } else if (newWord.value.audio instanceof File) {
        // Nếu có file audio, cần upload lên server trước để lấy URL
        // Hoặc tạm thời skip
        console.warn('Audio file detected but backend expects string URL');
      }
    }

    // Xử lý image - đảm bảo chỉ append File object
    if (newWord.value.image instanceof File) {
      formData.append('image', newWord.value.image);
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }

    try {
      let response;
      if (props.word) {
        response = await updateWord(formData, token);
        emit('update', newWord.value);
      } else {
        response = await createWord(formData, token);
        emit('save', response.data);
      }
      alert(response.message);
      closeForm();
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || error.message || "An error occurred");
    }
  };


  const toggleDropdown = () =>{
      isDropdownOpen.value = !isDropdownOpen.value;
  };

  const selectDefinition = (definition) =>{
      newWord.value.definition = definition;
      isDropdownOpen.value = false;
  }

  const openImage = (img) => {
    if (img instanceof File) {
      const imageUrl = URL.createObjectURL(img);
      newWord.value.image = imageUrl;
    } else {
      newWord.value.image = img;
    }
    showImg.value = true;
    visible.value = false;
  };

  const closeImage = () =>{
    showImg.value = false;
    visible.value = true;
  }
  watch(() => props.word, (newValue) => {
  if (newValue) {
    newWord.value = { ...newValue };
    newWord.value.image = null;
  }
  }, { immediate: true });

  const handlePlayAudio = () => {
    const audioElement = document.getElementById('audio');
    audioElement.play();
  };

</script>

<template>
  <OverlayBackground :isVisible="visible" @clickOverlay="closeForm" />
  <div class="container" v-if="visible">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="set-name">
          <label for="set-name">Set:</label>
          <p id="set-name">{{ props.setName }}</p>
        </div>
        <button class="close-btn" @click="closeForm">×</button>
      </div>
      <form @submit.prevent="saveData">
        <div class="form-group">
          <label for="word">Word:</label>
          <input type="text" v-model="newWord.word" placeholder="Enter word" @focusout="setWordAutoData(newWord.word)" />
        </div>
  
        <div class="form-group">
          <label for="audio">Audio:</label>
          <div class="audio-container">
            <button class="audio-button" type="button" @click="handlePlayAudio">
              <img class="audio-icon" src="../assets/speaker-icon.svg" alt="Speaker Icon" />
            </button>
            <audio id="audio" style="display: none;" controls></audio> <!-- Âm thanh sẽ được phát khi bấm loa -->
          </div>
        </div>
  
        <div class="form-group">
          <label for="ipa">IPA:</label>
          <input type="text" v-model="newWord.ipa" placeholder="Auto fill" />
        </div>
  
        <div class="form-group">
          <label for="definition">Definition:</label>
          <input class="definition-input" type="text" v-model="newWord.definition" placeholder="Enter or select definition" />
          
          <div class="custom-select">
            <img class="dropdown-icon" src="../assets/dropdown.svg" alt="Dropdown Icon"  @click="toggleDropdown"/>
            <ul v-show="isDropdownOpen" class="options">
                <li 
                    v-for="(definition, index) in definitions" 
                    :key="index" 
                    class="option" 
                    @click="selectDefinition(definition)">
                    {{ definition }}
                </li>
            </ul>
          </div>
      </div>
  
        <div class="form-group">
          <label for="example">Example:</label>
          <input type="text" v-model="newWord.example" placeholder="Enter example" />
        </div>
  
        <div class="form-group">
          <label for="image">Image:</label>
          <div class="img-container">
            <input type="file" @change="handleImageUpload" ref="fileInput" style="display: none;" />
            <img src="../assets/add_img.svg" alt="Upload Icon" class="icon-upload" @click="$refs.fileInput.click()" />
            <p v-if="newWord.image" class="new-image" @click="openImage(newWord.image)">Image</p>
          </div>
        </div>
  
        <div class="modal-actions">
          <button type="submit" class="add-btn">Save</button>
          <button type="button" @click="closeForm" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>

  </div>
  <ImageCard :Overlay_background ="showImg" :image="newWord.image" v-if="showImg" @close="closeImage"></ImageCard>
</template>


<style scoped>
  .modal-content {
    display: flex;
    flex-direction: column;
    align-items: center; 
    justify-content: flex-start; 
    background: white;
    padding: 0px;
    border-radius: 12px;
    width: 400px;
    height: 500px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 13;
    position: fixed; 
    top: 10%; 
    left: 50%; 
    transform: translateX(-50%); 
    overflow-y: auto; 
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #e0f7fa; /* Màu xanh nhạt */
    width: 100%;
    padding: 10px;
    border-radius: 8px 8px 0 0;
    position: relative;
    margin: 0;
    margin-bottom: 8px;;
  }

  .set-name {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
  }

  .set-name input {
    margin-left: 10px;
    padding: 5px;
    border: 1px solid black;
    border-radius: 4px;
    text-align: center; 
    width: 200px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 30px;
    cursor: pointer;
    margin-left: auto;
    margin-top: 0;
  }
  
  .form-group {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }

  /* .select-definition{
    width: 15px;
    height: 25px;
    border: none;
    position: fixed;
    top: 47%;
    left: 86%;
  } */

  /* .select-definition option{
    width: 100px;
    padding: 10px;
  } */

  .form-group label {
    width: 130px; /* Thiết lập chiều rộng cố định cho label */
    margin-right: 10px; /* Khoảng cách giữa label và input */
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
  }

  input[type="text"] {
    width: 100%; /* Đảm bảo input chiếm đầy chiều rộng */
    padding: 10px; /* Thêm padding cho input */
    border: 1px solid #ccc; /* Thêm border */
    border-radius: 4px; /* Làm bo tròn các góc input */
    box-sizing: border-box;
    
  }
  
  input[type="file"] {
    margin-top: 10px; /* Tạo khoảng cách giữa label và input file */
  }

  .audio-container {
    display: flex;
    align-items: center; /* Căn giữa theo chiều dọc */
    /* gap: 10px;           Khoảng cách giữa label và icon */
    width: 100%;         /* Đảm bảo phần tử chiếm hết chiều rộng */
    justify-content: center; /* Căn trái mặc định */
  }

  .audio-button{
    background-color: rgb(255, 255, 255);
    border: none;
    width: 30px;
  }

  audio {
    width: 40%; 
    margin-top: 10px; 
    height: 20px;
    margin-left: 10px;
  }

  .audio-icon{
    width: 20px;
    cursor: pointer;
  }

  .audio-icon:hover{
    transform: scale(1.05);
  }

  .definition-input{
    padding-right: 20px !important;
  }

  .custom-select {
    /* width: 200px; */
    position: relative;
    border: 1px solid #ccc;
    background-color: white;
  }

  .selected-option {
      padding: 10px;
      cursor: pointer;
      background-color: #f1f1f1;
      border-bottom: 1px solid #ccc;
  }

  .dropdown-icon{
    border: none;
    position: absolute;
    top: -12px;
    left: -25px;
  }

  .options {
      /* display: none; */
      position: absolute;
      top: 23px;
      left: -280px;
      width: 300px;
      max-height: 150px;
      overflow-y: auto;
      background-color: rgb(255, 255, 255);
      border: 1px solid #ffffff;
      list-style-type: none;
  }


  .option {
      display: flex;
      padding: 5px;
      cursor: pointer;
      width: 100%;
      white-space: normal; /* Cho phép nội dung xuống dòng */
      word-wrap: break-word; /* Cho phép từ dài xuống dòng */
      
  }

  .option:hover {
      background-color: #ddd;
  }

  .img-container{
    margin-right: 25px;
    display: flex;
    align-items: center; /* Căn giữa theo chiều dọc */
    /* gap: 10px;           Khoảng cách giữa label và icon */
    width: 100%;         /* Đảm bảo phần tử chiếm hết chiều rộng */
    justify-content: center; /* Căn trái mặc định */
  }

  .new-image:hover{
    color: blue;
    font-weight: 500;
  }

  .add-btn {
    background-color: #a8def0; /* Màu xanh nhạt */
    color: black;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-left: 50px;
    width: 100px;
    flex-grow: 1;
  }
  
  .cancel-btn {
    background-color: #ffccd5;
    color: black;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-right: 20px;
    width: 100px;
  }

  .icon-upload {
    cursor: pointer;
    margin-left: 40px;
    width: 60px; /* Đặt kích thước cố định theo yêu cầu */
    height: 60px;
    vertical-align: middle;
  }

  
</style>

  