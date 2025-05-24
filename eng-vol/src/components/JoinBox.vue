<script setup>
    import { defineProps, defineEmits, onMounted, ref } from 'vue';
    import OverlayBackground from './OverlayBackground.vue';
    import { joinClass, revokeJoinRequest, getJoinRequest } from '@/apis/classApi';

    const joinRequestId = ref("");
    const classId = localStorage.getItem('classId');
    const joinRevokeMode = ref("Join");
    const token = localStorage.getItem('token');

    const { classItem, Overlay_background } = defineProps(['classItem', 'Overlay_background']);
    const emit = defineEmits();

    function closeOverlay() {
        emit('close');
    }

    const join_button = async () => {
        if (!token) {
            window.location.href = '/login';
            alert('Login for to use this feature');
            return;
        }
        if (joinRevokeMode.value === "Join") {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const userId = user.id;
                const response = await joinClass(classId, userId, token);
                await fetchJoinRequest();
                alert(response.message);
            } catch (error) {
                console.error('Error while joining the class:', error);
                alert('Error while joining the class:', error);
            }
        } else {
            try {
                const response = await revokeJoinRequest(joinRequestId.value, token);
                await fetchJoinRequest();
                alert(response.message);
            } catch (error) {
                console.error('Error while revoking join request:', error);
                alert('Error while revoking join request:', error);
            }
        }
    };

    const fetchJoinRequest = async () => {
        try {
            const response = await getJoinRequest(classId, token);
            joinRequestId.value = response.classJoinRequestId;
            joinRevokeMode.value = "Revoke";
        } catch (error) {
            joinRevokeMode.value = "Join";
            console.error('Error while fetching join request:', error);
        }
    };

    onMounted(() => {
        fetchJoinRequest();
    });
</script>

<template>
    <OverlayBackground 
        :isVisible="Overlay_background" 
        @clickOverlay="closeOverlay" />
    <div class="class-container" @click.stop> 
        <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
        <div class="class-info">
            <div class="class-header">
                <img src="../assets/class.svg" alt="class-icon">
                <h1>{{ classItem.className }}</h1>
            </div>
            <p class="class-details">{{ classItem.numberOfSets }} {{ classItem.numberOfMembers === 1 ? 'set' : 'sets' }} | {{ classItem.numberOfMembers }} {{ classItem.numberOfMembers === 1 ? 'member' : 'members' }}</p>
            <div class="join-button" @click="join_button">
                <p>{{ joinRevokeMode }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .class-container {
        position: fixed;
        top: 25%;
        left: 35%;
        padding: 10px;
        z-index: 15;
        padding: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5%;
        width: 30%;
        height: 50%;
        background-color: white;
        overflow: hidden;
    }

    .class-container .close-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
    }

    .class-container .class-info {
        position: absolute;
        text-align: center;
        justify-content: center;
    }

    .class-info .class-header {
        position: relative;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    .class-info .class-details {
        margin-bottom: 20px;
    }

    .join-button {
        background-color: #BDEDF5;
        padding: 10px 20px;
        width: 100px;
        border-radius: 20px;
        cursor: pointer;
        display: inline-block;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.15);
    }

    .join-button p {
        margin: 0;
        font-size: 18px;
        color: #333;
    }

    .join-button:hover {
        background-color: #91e3df;
    }
</style>