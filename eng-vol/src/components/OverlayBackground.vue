<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    isVisible: {
      type: Boolean,
      required: true
    }
});

const emits = defineEmits(['clickOverlay']);

const handleOverlayClick = () => {
    emits('clickOverlay');
};
</script>

<template>
    <div v-if="isVisible" class="overlay" @click="handleOverlayClick"></div>
</template>

<style scoped>
    .overlay {
        background-color: rgba(71, 69, 69, 0.5); 
        position: fixed;
        top: 50.67px;
        left: 0;
        width: 100%;
        height: 100%; 
        z-index: 10; 
    }
</style>
