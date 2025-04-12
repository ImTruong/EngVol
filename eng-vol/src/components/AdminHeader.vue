<script>
    import { RouterLink } from 'vue-router';
    const navToClasses = () => {
        this.$router.push('/admin/class');
    }
    const navToMembers = () => {
        this.$router.push('/admin/member');
    }
    const navToSets = () => {
        this.$router.push('/admin/set');
    }
</script>

<template>
    <div class="admin-header">
        <div class="tabs">
            <button @click="navToMembers"><router-link to="/admin" class="navToMember">Users</router-link></button>
            <button @click="navToClasses"><router-link to="/admin/class" class="navToClass">Classes</router-link></button>
            <button @click="navToSets"><router-link to="/admin/set" class="navToSet">Sets</router-link></button>
        </div>
        <div class="line"></div>
    </div>
</template>

<style>
    .admin-header {
        display: flex;
        flex-direction: row;
        width: 90%;
        max-width: 1200px;
        margin: 20px auto;
        border-radius: 15px;
        background-color: cadetblue;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        background-color: #f8f9fa;
        padding: 20px;
        overflow: hidden;
    }
    .tabs {
        display: flex;
        gap: 20px;
    }
    
    .tabs button {
        background: none;
        border: none;
        padding: 10px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        color: #333;
    }
    .line {
        /* position: absolute; */
        display: flex;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 1px;
        background-color: rgba(14, 14, 14, 0.1); 
        margin-bottom: 30px;
    
    }
    </style>