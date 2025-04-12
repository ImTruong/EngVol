<script setup>
  import {ref, defineProps} from "vue"
  import {useRouter} from "vue-router"
  import SetTable from "../components/SetTable.vue"
  import { useStore } from 'vuex';
  import { deleteSet } from "@/apis/setApi";
  import { defineEmits } from 'vue';

  const emit = defineEmits(['delete']);
  const hover  = ref(false);
  const router = useRouter();
  const props = defineProps(['set', 'classId']);
  const set = props.set;
  const setTable = ref(false); 
  const existingSet = ref({});
  const isEditMode = ref(false);

  const store = useStore();

  const editSet = () => {
    showSetTable(true, set)
  }

  const updateCurrentSet = (set) => {
    store.dispatch('setModule/setCurrentSet', set);
  };

  const gameSet = () => {
    if (!set.wordResponses || set.wordResponses.length === 0) {
        alert("No words in this set!");
        return; 
    }
    updateCurrentSet(set);
    router.push(`/fillgame/${set.id}`);
  }

  const studySet = () => {
    if (!set.wordResponses || set.wordResponses.length === 0) {
        alert("Please add words before studying!");
        return; 
    }
    updateCurrentSet(set);
    router.push(`/flashcard/${set.id}`); 
  };

  const showSetTable = (editMode, existingSetData) => {
    setTable.value = true; 
    isEditMode.value = editMode; 
    existingSet.value = existingSetData;
  }

  const closeSetTable = () => {
    setTable.value = false;
  };

  const handleUpdate = (updatedRows) => {
    existingSet.value.wordListResponses = updatedRows;
  };

  const handleDeleteSet = async () => {
    try {
      await deleteSet(set.id);
      alert("Set deleted successfully!");
      emit("delete", set.id);
    } catch (error) {
      alert(error)
    }
  }

</script>

<template>
    <div class="card" @mouseover="hover = true" @mouseleave="hover = false" >
      <div class="card-text">
        <h2>{{ set.name }}</h2>
        <p class="number-terms">{{ set.numberOfWords }} {{ set.numberOfWords <= 1 ? 'term' : 'terms' }} </p>
        <p>{{ set.userDetailResponse.fullName}}</p>
      </div>
      <div class="set-option">
        <div class="icon-container">
            <img src="../assets/study.svg" alt="Study" @click.stop="studySet" />
        </div>
        <div class="icon-container" @click.stop="gameSet" >
          <img src="../assets/game.svg" alt="Game">
        </div>
        <div class="icon-container" @click.stop="editSet" >
          <img src="../assets/edit.svg" alt="Edit">
        </div>
        <div class="icon-container" @click.stop="deleteSet" >
          <img src="../assets/delete.svg" alt="Delete">
        </div>
      </div>
    </div>
    <SetTable 
        v-if="setTable" 
        :isEditMode="isEditMode" 
        :existingSet="existingSet"
        :classId="props.classId"
        @close="closeSetTable" 
        @update="handleUpdate"
      />
</template>
  

<style scoped>
  .card {
    margin-left: 10px;
    width: 28%;
    min-width: 280px;
    height: 160px;
    overflow: hidden;
    border-radius: 4%;
    box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 35px;
    cursor: pointer;
    position: relative;
  }
  
  .card:hover {
    transform: scale(1.05);
    background-color:#e6e6e6;
  }

  .card-text {
      position: absolute;
      padding: 10px;
  }

  .card-text h2 {
      font-weight: 500;

  }

  .card-text p {
      color: #777;
      margin-top: 5px;
      margin-bottom: 40px;
  }

  .number-terms{
      background-color: rgba(105, 105, 148, 0.2);
      border-radius: 5px;
      width: 60px;
      height: 25px;
      text-align: center;
  }

  .set-option {
    /* position: absolute; */
    display: flex;
    gap: 10px;
    visibility: hidden;
    transition: visibility 0.1s ease;
    justify-content: center;
    align-items: center;
    height: 100%;
    flex-wrap: wrap;
  }

  .set-option .icon-container{
    width: 60px;
    height: 40px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card:hover .icon-container {
    visibility: visible;
  }

  .card:hover .card-text {
    visibility: hidden;
  }

  .set-option img {
    width: 90px;
  }

  .set-option .icon-container:hover {
    transform: scale(1.1);
    cursor: pointer;

  }

</style>