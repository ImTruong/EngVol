<script setup>
    import ClassModal from '@/components/ClassModal.vue'
    import JoinBox from './JoinBox.vue';
    import SetBox from "./SetBox.vue"
    import {ref, computed, onMounted} from "vue"
    import { defineProps} from 'vue';
    import ClassTable from './ClassTable.vue';
    import { useStore } from 'vuex';

    const classModalMode = ref(false);
    const classTableMode = ref(false);
    const joinMode = ref(false);
    const store = useStore();
    const myClasses = computed(() => store.getters["classModule/getClasses"]);
    const myClassIds = ref([]);


    const {sets, classes} = defineProps(['sets','classes']);

    const activeTab = ref("Flashcard sets");
    const selectedClassItem = ref("");
    const isMember = ref(false);

    
    const selectClass = (classItem) => {
        selectedClassItem.value = classItem;
        localStorage.setItem('classId', selectedClassItem.value.classId);
        localStorage.setItem('className', selectedClassItem.value.className);
        myClassIds.value = myClasses.value.map(item => item.classId);
        isMember.value = myClassIds.value.includes(selectedClassItem.value.classId);
        joinMode.value = !isMember.value;
    }

    const showClassTable = (classItem) => {
        if(isMember){
            classTableMode.value = true;
            localStorage.setItem('libraryMode', activeTab.value);
            selectClass(classItem);
        }
    }

    const showClassModal = (classItem) => {
        if(isMember){
            classModalMode.value = true;
            selectClass(classItem);
        }
    }
    

    

    function closeOverlay() {
        emit('close');
        isMember.value = false;
        window.location.reload();
    }

    const switchTab = () =>{
        if(activeTab.value == "Flashcard sets"){
            activeTab.value = "Classes";
        }
        else{
            activeTab.value = "Flashcard sets"
        }
    }


</script>

<template>
    <main>
        <div class="tabs">
          <button :class="{ active: activeTab == 'Flashcard sets' }" @click="switchTab">Flashcard sets</button>
          <button :class="{ active: activeTab == 'Classes' }" @click="switchTab">Classes</button>
        </div>
        <div class="line"></div>
        <div class="sets-list"  v-if="activeTab == 'Flashcard sets'">
            <div class="sets-container">
                <div v-for="set in sets" :key="set.id" class="card-wrapper">
                    <SetBox :set="set" />
                </div>
            </div>
        </div>
        <div class="class-list"  v-if="activeTab == 'Classes'">
            <div v-for="classItem in classes" :key="classItem.id" class="class-card" @click="showClassModal(classItem)">
                <img src="../assets/class.svg" alt="Icon" class="class-icon">
                <div class="class-info">
                    <h3>{{ classItem.className }}</h3>
                    <div class="class-detail" >
                        <p>{{ classItem.numberOfSets }} {{ classItem.numberOfSets <= 1 ? 'set' : 'sets' }} |</p>

                        <p> {{ classItem.numberOfMembers }} {{ classItem.numberOfMembers <= 1 ? 'member' : 'members' }}</p>
                    </div>
                </div>
            </div>

        </div>
        <ClassModal
          v-if="classModalMode && isMember"
          :Overlay_background ="classModalMode"
          @close ="classModalMode = false"
        />
        <ClassTable
            v-if="classTableMode && isMember"
            :isEditMode=true
            @close="classTableMode = false"
        />
        <JoinBox
            v-if="!isMember && joinMode"
            :classItem ="selectedClassItem" 
            :Overlay_background ="!isMember && joinMode" 
            @close ="joinMode = false"
        ></JoinBox>
        <!-- <InvitationBox
        :classItem ="selectedClassItem" 
        :Overlay_background ="Overlay_background" 
        @close ="Overlay_background = false"
        ></InvitationBox> -->
    </main>
</template>
  
    
<style scoped>    
    main {
        position: absolute;
        top: 40px;
        left: 0px;
        width: 100%;
    }
    
    .tabs {
        display: flex;
        gap: 20px;
    }
    
    .tabs button {
        background: none;
        border: none;
        padding: 10px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        color: #333;
    }
    
    .tabs button.active {
        border-bottom: 2px solid black;
    }
    
    .line {
        /* position: absolute; */
        display: flex;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 1px;
        background-color: rgba(14, 14, 14, 0.1); 
        margin-bottom: 30px;
    
    }
    
    .class-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        
    }
    
    .class-card {
        display: flex;
        align-items: center;
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        
    }

    .class-card:hover{
        transform: scale(1.05);
    }
    
    
    .class-icon {
        /* position: relative; */
        font-size: 30px;
        margin-right: 20px;
    }
    
    .class-info h3 {
        margin: 0;
        font-weight: bold;
        font-size: 18px;
    }

    .class-list .class-detail{
        display: flex;
    }
    
    .class-info p {
        margin: 0;
        font-size: 14px;
        color: gray;
        margin-left: 5px;
        cursor: pointer;
    }

    .class-info p:hover{
        transform: scale(1.1);
    }

    .sets-container {
        display: flex;
        flex-wrap: wrap; 
        gap: 20px;
    }
    
    .card-wrapper {
        /* flex: 1 1 calc(33.33% - 20px); */
        min-width: 250px;
    }
</style>

