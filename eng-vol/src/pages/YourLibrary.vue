<script setup>
import Header from '@/components/Header.vue';
import LibraryBody from "@/components/LibraryBody.vue";
import { getLibrarySet } from "@/apis/setApi.js";
import { getCurrentUserClasses } from "@/apis/classApi.js";
import { onMounted, ref } from "vue";

const token = localStorage.getItem('token');

// Sets pagination
const sets = ref(null);
const setsPage = ref(0);
const setsSize = ref(12);
const setsTotalPages = ref(0);
const setsTotalElements = ref(0);

// Classes pagination
const classes = ref(null);
const classesPage = ref(0);
const classesSize = ref(10);
const classesTotalPages = ref(0);
const classesTotalElements = ref(0);

// Load data cho sets
const fetchSets = async () => {
  try {
    const setsData = await getLibrarySet(token, setsPage.value, setsSize.value);
    sets.value = setsData.content;
    setsTotalPages.value = setsData.totalPages;
    setsTotalElements.value = setsData.totalElements;
  } catch (error) {
    console.error("Error fetching sets:", error);
  }
};

// Load data cho classes
const fetchClasses = async () => {
  try {
    const classesData = await getCurrentUserClasses(token, classesPage.value, classesSize.value);
    classes.value = classesData.content;
    classesTotalPages.value = classesData.totalPages;
    classesTotalElements.value = classesData.totalElements;
  } catch (error) {
    console.error("Error fetching classes:", error);
  }
};

// Xử lý phân trang sets
const changeSetsPage = (newPage) => {
  setsPage.value = newPage;
  fetchSets();
};

// Xử lý phân trang classes
const changeClassesPage = (newPage) => {
  classesPage.value = newPage;
  fetchClasses();
};

const handleReload = async () => {
  console.log("Reload triggered in YourLibrary");
  await new Promise(resolve => setTimeout(resolve, 300));
  await fetchSets();
  await fetchClasses();

};

onMounted(() => {
  if (token == null) {
    alert('Login to use this feature');
    window.location.href = '/login';
    return;
  }
  fetchSets();
  fetchClasses();
});
</script>

<template>
  <div id="app">
    <Header @reload="handleReload" />
    <main>
      <h2>Your library</h2>
      <LibraryBody
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
          @reload="handleReload"
      />
    </main>
  </div>
</template>

<style scoped>
main {
  padding: 100px;
}
h2 {
  font-weight: bold;
  margin-bottom: 30px;
}
</style>