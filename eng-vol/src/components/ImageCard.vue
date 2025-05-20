<script setup>
    import { defineProps, defineEmits } from 'vue';
    import OverlayBackground from './OverlayBackground.vue';

    const emit = defineEmits();
    const {Overlay_background, image} = defineProps(['Overlay_background', 'image']);
    function closeOverlay(){
        emit('close');
    }
    
</script>

<template>
    <OverlayBackground 
        :isVisible="Overlay_background" 
        @clickOverlay="closeOverlay" />
    <div class="container" v-if="Overlay_background">  
        <img :src="image" alt="class" />
        <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
    </div>

</template>

<style scoped>
    .container{
        position: fixed;
        top: 20vh;
        left: 25vw;
        z-index: 15;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 15px;
        width: 50vw; 
        height: 60vh;
        padding: 40px;
        text-align: center;
        background-color: white;
        overflow: hidden;
    }

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 15px;
    }

    .close-icon{
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;

    }
    
</style>