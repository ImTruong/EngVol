<script setup>
    import { ref, watch, defineEmits, defineProps, computed, onMounted } from 'vue';
    import OverlayBackground from '../components/OverlayBackground.vue';
    import ModifyCardModal from '../components/ModifyCardModal.vue';
    import ImageCard from './ImageCard.vue';
    import { saveSetInfo } from '@/apis/setApi';
    import { deleteWord } from '@/apis/wordApi';
    import { getCurrentUserClasses } from '@/apis/classApi';

    const emit = defineEmits(['close', 'save', 'update']);
    const props = defineProps(['isEditMode', 'existingSet', 'classId', 'className', 'inClass']);
    const visible = ref(true);
    const setName = ref(props.isEditMode ? props.existingSet.name : '');
    const rows = ref(props.isEditMode ? props.existingSet.wordResponses : [{ id: '', word: '', ipa: '', audio: '', definition: '', example: '', image: '' }]);
    const selectedWords = ref([]);
    const showSelectColumn = ref(false);
    const showOptions = ref(false);
    const selectedOption = ref(props.isEditMode ? props.existingSet.privacyStatus : (props.inClass ? 'CLASS' : 'PRIVATE'));
    const dropdownRef = ref(null);
    const isEditWord = ref(false);
    const showModifyCardModal = ref(false);
    const classId = ref((props.isEditMode && props.existingSet.privacyStatus === 'CLASS') || props.inClass ? props.classId : '');
    const isSearchVisible = ref(false);
    const searchTerm = ref('');
    const editWord = ref(null);
    const classSuggestions = ref([]);
    const myClasses = ref([]);
    const searchClass = ref(props.isEditMode && props.existingSet.privacyStatus === 'CLASS' ? localStorage.getItem('className') : (props.inClass ? props.className : ''));
    const user = JSON.parse(localStorage.getItem('user'));
    const showImg = ref(false);
    const image = ref("");
    const token = localStorage.getItem('token');

    onMounted(async() => {
        myClasses.value = await getCurrentUserClasses(token);
        
    });

    const saveSetInfoInfo = async () => {
        showOptions.value = false;
        const payload = {
            setId: props.isEditMode ? props.existingSet.id : null,
            name: setName.value,
            description: "My set",
            privacyStatus: selectedOption.value,
            classId: classId.value || null
        };
        try {
            const response = await saveSetInfo(payload, token, props.isEditMode);
            if (props.isEditMode) {
                emit('update', response);
            } else {
                emit('save', response);
            }
        } catch (error) {
            alert(error);
            selectedOption.value = props.existingSet.privacyStatus;
        }
    };

    const addNewWord = (newWord) => {
        if (rows.value[0].word === '') {
            rows.value[0] = newWord;
        } else {
            rows.value.push(newWord);
        }
    };

    const removeRow = async () => {
        if (selectedWords.value.length > 0) {
            for (const wordId of selectedWords.value) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await deleteWord(wordId, token);
                    rows.value = rows.value.filter(row => row.id !== wordId);
                    if (response.message) {
                        alert(response.message);
                    }
                } catch (error) {
                    throw new Error(error);
                }
            }
            selectedWords.value = [];
        }
        emit('update', rows.value);
    };

    const closeForm = () => {
        emit('close');
        visible.value = false;
    };

    const toggleSelectWord = (row) => {
        const index = selectedWords.value.indexOf(row.id);
        if (index === -1) {
            selectedWords.value.push(row.id);
        } else {
            selectedWords.value.splice(index, 1);
        }
    };

    const toggleSelectColumn = () => {
        showOptions.value = false;
        showSelectColumn.value = !showSelectColumn.value;
    };

    const toggleOptions = () => {
        showOptions.value = !showOptions.value;
    };

    const selectOption = (option) => {
        selectedOption.value = option;
    };

    const openModifyCardModal = () => {
        showOptions.value = false;
        // if (props.isEditMode && props.existingSet.userDetailResponse.username !== user.username) {
        //     alert("You aren't authorized to modify this set!");
        //     return;
        // }
        if (!props.isEditMode && !setName.value) {
            alert("Save set before add words.");
            return;
        }
        showModifyCardModal.value = true;
        visible.value = false;
    };

    const closeModifyCardModal = () => {
        isEditWord.value = false;
        visible.value = true;
        showModifyCardModal.value = false;
    };

    const handlesaveSetInfoInfo = () => {
        if (setName.value.trim()) {
            if (selectedOption.value === 'CLASS' && !classId) {
                console.log('Please enter classname');
                return;
            }
            saveSetInfoInfo();
        } else {
            alert("Please enter setname");
        }
    };

    const toggleSearch = () => {
        showOptions.value = false;
        isSearchVisible.value = !isSearchVisible.value;
    };

    const EditRow = (row) => {
        isEditWord.value = true;
        editWord.value = row;
        openModifyCardModal();
    };

    const filteredRows = computed(() => {
        if (!isSearchVisible.value || !searchTerm.value.trim()) {
            return rows.value;
        }
        return rows.value.filter(row => row.word.toLowerCase().includes(searchTerm.value.toLowerCase().trim()));
    });

    const updateWord = (updatedWord) => {
        const index = rows.value.findIndex(row => row.id === updatedWord.id);
        if (index !== -1) {
            rows.value[index] = updatedWord;
        } else {
            console.error('Word not found in rows');
        }
        emit('update', rows.value);
    };

    watch(() => props.existingSet, (newExistingSet) => {
        if (newExistingSet && newExistingSet.words) {
            setName.value = newExistingSet.name;
            rows.value = newExistingSet.words;
            selectedOption.value = newExistingSet.privacyStatus || '';
            classId.value = newExistingSet.privacyStatus === 'CLASS' ? props.classId : '';
        }
    }, { deep: true });

    watch(searchClass, () => {
        classSuggestions.value = [];
        for (let i = 0; i < myClasses.value.length; i++) {
            if (myClasses.value[i].className.toLowerCase === searchClass.value.toLowerCase) {
                classSuggestions.value.push(myClasses.value[i]);
            }
        }
    });

    const selectClass = (classItem) => {
        searchClass.value = classItem.className;
        classId.value = classItem.classId;
        classSuggestions.value = [];
    };

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
            <div class="option-container">
                <button @click.stop="selectOption('CLASS')" class="option-button">
                    <img src="../assets/lock.svg" alt="class" class="option-icon" />
                    <span class="option-text">Class</span>
                    <span v-if="selectedOption === 'CLASS'" class="checkmark">✔</span>
                </button>
                <input
                    v-if="selectedOption === 'CLASS'"
                    v-model="searchClass"
                    @input="fetchClassList"
                    type="text"
                    placeholder="Enter class name"
                    class="class-input"
                />
                <ul v-if="classSuggestions.length > 0 && selectedOption === 'CLASS'" class="dropdown-list">
                    <li
                        v-for="(classItem, index) in classSuggestions"
                        :key="index"
                        @click="selectClass(classItem)"
                        class="dropdown-item"
                    >
                        {{ classItem.className }}
                    </li>
                </ul>
            </div>
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
            <button @click="handlesaveSetInfoInfo" class="icon-button">
                <img src="../assets/save.svg" alt="" class="icon">
            </button>
        </div>
    </div>
    <ModifyCardModal 
        :setName="setName"         
        :setId="props.existingSet.id" 
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

    .option-container {
        display: flex;
        align-items: center;
    }
    
    .option-button {
        display: flex;
        align-items: center;
        margin-right: 8px;
    }

    .class-input {
        margin: 4px;
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .dropdown-list {
        position: absolute;
        top: 100%;
        left: 50%;
        width: 50%;
        max-height: 200px;
        overflow-y: auto;
        margin: 0;
        padding: 0;
        list-style-type: none;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: #fff;
        z-index: 10;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .dropdown-item {
        padding: 10px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .dropdown-item:hover {
        background-color: #f0f0f0;
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
</style>