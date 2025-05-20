<script setup>
    import { defineProps, defineEmits, onMounted, watch } from 'vue';
    import { ref } from 'vue';
    import LibraryBody from './LibraryBody.vue';
    import { getClassesByName } from '@/apis/classApi';
    import { getSetsByName } from '@/apis/setApi';
    import OverlayBackground from './OverlayBackground.vue';


    const {searchQuery,  Overlay_background } = defineProps(['searchQuery', 'Overlay_background']);
    const sets = ref([]);
    const token = localStorage.getItem('token');


    const emit = defineEmits();

    function closeOverlay(){
        emit('close');
    }

    const classes = ref([]);

    async function getClasses() {
      try{
        classes.value = await getClassesByName(searchQuery, token);
      }
      catch(e){
        console.log(e);
        alert(e);
      }
    }

    async function getSets() {
      try{
        sets.value = await getSetsByName(searchQuery, token);
      }
      catch(e){
        console.log(e);
        alert(e);
      }
    }

    watch(
        () => searchQuery,
        (newQuery) => {
            getClasses();
            getSets();
        },
        { immediate: true }
    );
    onMounted(() => {
        getClasses();
        getSets();
    });

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