<script setup>
import Header from '@/components/Header.vue';
import LibraryBody from "@/components/LibraryBody.vue";
import { computed, onMounted, ref } from "vue";
import { useStore } from 'vuex';

const store = useStore();
const token = localStorage.getItem('token');

// Ensure computed properties are reactive
const classes = computed(() => store.getters['classModule/getClasses'].slice().reverse());
const sets = computed(() => store.getters['setModule/getSets']);

onMounted(async () => {
    try {
        await Promise.all([
            store.dispatch('setModule/fetchLibrarySets', token),
            store.dispatch('classModule/fetchClassData', token),
        ]);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});
</script>

<template>
    <div id="app">
        <Header></Header>
        <main>
            <h2>Your library</h2>
            <LibraryBody
                :sets="sets"
                :classes="classes"
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
