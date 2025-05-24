<script setup>
    import { defineProps, defineEmits, onMounted, ref } from 'vue';
    import OverlayBackground from './OverlayBackground.vue';
    import { getRequest, handleAccept, handleReject } from '@/apis/classApi';

    const { requestId, Overlay_background, requestType } = defineProps(['requestId', 'Overlay_background', 'requestType']);
    const token = localStorage.getItem('token');
    const classItem = ref("");
    const fromUser = ref("");
    const emit = defineEmits();
    const userMessgage = ref("");
    const apiUrl = ref("");

    function closeOverlay() {
        emit('close');
    }

    const fetchRequest = async () => {
        if (requestType === "CLASS_JOIN_REQUEST") {
            apiUrl.value = `/class/request/join/${requestId}`;
        } else if (requestType === "CLASS_INVITATION") {
            apiUrl.value = `/class/invitation/${requestId}`;
        }
        try {
            const response = await getRequest(apiUrl.value, token);
            classItem.value = response.data.classInformationResponse;

            if (requestType === "CLASS_JOIN_REQUEST") {
                fromUser.value = response.requesterName;
                userMessgage.value = "Requester: ";
            } else if (requestType === "CLASS_INVITATION") {
                fromUser.value = response.inviterUsername;
                userMessgage.value = "Inviter: ";
            }
        } catch (error) {
            console.error('Error fetching request:', error);
        }
    };

    const acceptRequest = async () => {
        if (requestType === "CLASS_JOIN_REQUEST") {
            apiUrl.value = `/class/request/join/accept?requestId=${requestId}`;
        } else if (requestType === "CLASS_INVITATION") {
            apiUrl.value = `/class/invitation/accept?invitationId=${requestId}`;
        }
        try {
            const response = await handleAccept(apiUrl.value, token);
            alert(response);
            closeOverlay();
        } catch (error) {
            alert(error)
        }
    };

    const rejectRequest = async () => {
        if (requestType === "CLASS_JOIN_REQUEST") {
            apiUrl.value = `/class/request/join/reject?requestId=${requestId}`;
        } else if (requestType === "CLASS_INVITATION") {
            apiUrl.value = `/class/invitation/reject?invitationId=${requestId}`;
        }
        try {
            const response = await handleReject(apiUrl.value, token);
            alert(response);
            closeOverlay();
        } catch (error) {
            alert(error);
        }
    };

    onMounted(() => {
        fetchRequest();
    });
</script>

<template>
    <OverlayBackground 
        :isVisible="Overlay_background" 
        @clickOverlay="closeOverlay" />
    <div class="class-container" v-if="Overlay_background">  
        <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
        <div class="class-info">
            <div class="class-header">
                <img src="../assets/class.svg" alt="class-icon">
                <h1>{{ classItem.className }}</h1>
            </div>
            <p>{{ classItem.numberOfSets }} {{ classItem.numberOfMembers <= 1 ? 'set' : 'sets' }} | {{ classItem.numberOfMembers }} {{ classItem.numberOfMembers <= 1 ? 'member' : 'members' }}</p>
            <p class="fromUser">{{ userMessgage }} {{ fromUser }}</p>
            <div class="button">
                <div class="accept-button" @click="acceptRequest">
                    <p>Accept</p>
                </div>
                <div class="reject-button" @click="rejectRequest">
                    <p>Reject</p>
                </div>
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

    .class-info .fromUser {
        margin-bottom: 20px;
    }

    .button {
        display: flex;
    }

    .accept-button {
        background-color: #BDEDF5;
        padding: 10px;
        width: 100px;
        border-radius: 20px;
        cursor: pointer;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.15);
    }

    .reject-button {
        background-color: #FF9FA8;
        padding: 10px;
        width: 100px;
        border-radius: 20px;
        cursor: pointer;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.15);
        margin-left: 10px;
    }

    .button p {
        margin: 0;
        font-size: 18px;
        color: #333;
    }

    .accept-button:hover {
        background-color: #91e3df;
    }

    .reject-button:hover {
        background-color: #f37c88;
    }
</style>