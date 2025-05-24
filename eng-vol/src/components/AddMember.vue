<script setup>
import OverlayBackground from './OverlayBackground.vue';
import { defineEmits, ref, watch } from 'vue';
import { checkInviteExistance, inviteUser, revokeUser } from '@/apis/classApi';

const emit = defineEmits(['close', 'save']);
const visible = ref(true);
const className = localStorage.getItem('className');
const inviteRovokeMode = ref('Invite');

function closeOverlay() {
    emit('close');
}

const invitee = ref("");
const classId = localStorage.getItem('classId');
const invitationId = ref("");
const token = localStorage.getItem('token');

const fetchInvite = async () => {
    try {
        const response = await checkInviteExistance(invitee.value, classId, token);
        invitationId.value = response.classInvitationId;
        if (response.classInvitationId) {
            inviteRovokeMode.value = "Revoke";
        }
    } catch (error) {
        console.error('Error while calling API:', error);
    }
};

const handleInviteUser = async () => {
    try {
        const message = await inviteUser(classId, invitee.value, token);
        alert(message);
        inviteRovokeMode.value = "Revoke";
        fetchInvite();
    } catch (error) {
        console.log(error)
        alert(error);
    }
};

const handleRevokeUser = async () => {
    try {
        fetchInvite();
        if (!invitationId.value) {
            console.error('Invitation ID is missing');
            return;
        }
        const message = await revokeUser(invitationId.value, token);
        alert(message);
        inviteRovokeMode.value = "Invite";
    } catch (error) {
        alert(error);
    }
};

const inviteRevokeUser = () => {
    if (inviteRovokeMode.value === "Invite") {
        handleInviteUser();
    } else {
        handleRevokeUser();
    }
};

watch(invitee, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        fetchInvite();
        inviteRovokeMode.value = "Invite";
    }
});
</script>

<template>
    <OverlayBackground :isVisible="visible" @clickOverlay="closeOverlay"> </OverlayBackground>
    <div class="container">
        <div class="header">
            <p>Class:</p>
            <div class="className">
                {{ className }}
            </div>

            <img src="../assets/close.svg" alt="Icon" class="close-icon" @click="closeOverlay">
        </div>
        <div class="invitee">
            <p>Username:</p>
            <input type="text" v-model="invitee" placeholder="Enter username">
        </div>
        <div class="button">
            <button class="invite" @click="inviteRevokeUser">{{inviteRovokeMode}}</button>
            <button class="cancel" @click="closeOverlay">Cancel</button>
        </div>
    </div>
</template>

<style scoped>
.container {
    position: fixed;
    top: 25vh;
    left: 35vw;
    display: flex;
    flex-direction: column;
    height: 50vh;
    width: 30vw;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background-color: white;
    overflow: hidden;
    z-index: 11;
}

.header {
    position: absolute;
    height: 50px;
    background-color: #BDEDF5;
    width: 100%;
    top: 0;
    display: flex;
    align-items: center;
}

.header .className {
    width: 50%;
    height: 30px;
    margin-left: 5px;
    border-radius: 5px;
    background-color: white;
    text-align: center;
    align-items: center;
}

.header p {
    margin-left: 17%;
}

.close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
}

.invitee {
    display: flex;
    margin-top: 30px;
}

.invitee input {
    width: 60%;
    height: 30px;
    margin-left: 10px;
}

button {
    height: 30px;
    width: 70px;
    border-radius: 5px;
    border: none;
    box-shadow: 2px 2px 2px #bcbcbc;
    margin: 50px 20px 20px 0;
}

.invite {
    background-color: #BDEDF5;
}

.invite:hover {
    background-color: #61e5fd;
}

.cancel {
    background-color: #FF9FA8;
}

.cancel:hover {
    background-color: #f37c88;
}
</style>