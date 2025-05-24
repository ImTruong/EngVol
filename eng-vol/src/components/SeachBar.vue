<script setup>
import { defineProps, defineEmits, onMounted, watch } from 'vue';
import { ref } from 'vue';
import LibraryBody from './LibraryBody.vue';
import { getClassesByName } from '@/apis/classApi';
import { getSetsByName, getAllPublicSet } from '@/apis/setApi';
import OverlayBackground from './OverlayBackground.vue';


const {searchQuery, Overlay_background } = defineProps(['searchQuery', 'Overlay_background']);

// Sets pagination
const sets = ref([]);
const setsPage = ref(0);
const setsSize = ref(10);
const setsTotalPages = ref(0);
const setsTotalElements = ref(0);

// Classes pagination
const classes = ref([]);
const classesPage = ref(0);
const classesSize = ref(10);
const classesTotalPages = ref(0);
const classesTotalElements = ref(0);

const token = localStorage.getItem('token');

const emit = defineEmits();

function closeOverlay(){
  emit('close');
}

async function getClasses() {
  try{
    const classesData = await getClassesByName(searchQuery, token, classesPage.value, classesSize.value);
    classes.value = classesData.content;
    classesTotalPages.value = classesData.totalPages;
    classesTotalElements.value = classesData.totalElements;
  }
  catch(e){
    console.log(e);
    alert(e);
  }
}

async function getSets() {
  try{
    const setsData = await getSetsByName(searchQuery, token, setsPage.value, setsSize.value);
    sets.value = setsData.content;
    setsTotalPages.value = setsData.totalPages;
    setsTotalElements.value = setsData.totalElements;
  }
  catch(e){
    console.log(e);
    alert(e);
  }
}

async function getSetsForGuest() {
  try{
    const setsData = await getAllPublicSet(setsPage.value, setsSize.value, searchQuery);
    sets.value = setsData.content;
    setsTotalPages.value = setsData.totalPages;
    setsTotalElements.value = setsData.totalElements;
  }
  catch(e){
    console.log(e);
    alert(e);
  }
}

// Pagination handlers
const changeSetsPage = (newPage) => {
  setsPage.value = newPage;
  if(token != null) {
    getSets();
  } else {
    getSetsForGuest();
  }
};

const changeClassesPage = (newPage) => {
  classesPage.value = newPage;
  getClasses();
};

watch(
    () => searchQuery,
    (newQuery) => {
      // Reset pagination when search query changes
      setsPage.value = 0;
      classesPage.value = 0;

      getClasses();
      if(token != null)
        getSets();
      else
        getSetsForGuest();
      console.log(sets.value)
      console.log(classes.value)
    },
    { immediate: true }
);

</script>

<template>
  <OverlayBackground
      :isVisible="Overlay_background"
      @clickOverlay="closeOverlay" />
  <div class="classbox-container" v-if="Overlay_background">
    <div class="header">
      <h1>{{ searchQuery }}</h1>
      <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
    </div>
    <LibraryBody
        class="libraryBody"
        :sets="sets"
        :classes="classes"
        :sets-page="setsPage"
        :sets-total-pages="setsTotalPages"
        :sets-total-elements="setsTotalElements"
        :classes-page="classesPage"
        :classes-total-pages="classesTotalPages"
        :classes-total-elements="classesTotalElements"
        @change-sets-page="changeSetsPage"
        @change-classes-page="changeClassesPage"
    />
  </div>

</template>

<style scoped>

.classbox-container{
  position: fixed;
  top: 15vh;
  left: 20vw;
  height: 75vh;
  width: 60vw;

  border-radius: 8px;
  background-color: white;
  z-index: 11;
}

.header{
  position: absolute;
  top: 10px;
  width: 100%;
}


.header .close-icon{
  position: absolute;
  right: 10px;
  cursor: pointer;

}


.header h1{
  position: absolute;
  top: 0;
  bottom: 10px;
  height: 50px;
  width: 100%;
  text-align: center;
}

.classbox-container .libraryBody{
  position: absolute;
  top: 12%;
  height: 80%;
  padding: 30px;
  overflow-y: auto;
}

</style>