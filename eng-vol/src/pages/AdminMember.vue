<script setup>
import { ref } from 'vue';
import AdminHeader from '@/components/AdminHeader.vue';

const members = ref([
    { id: 1, username: "user1", fullname: "User 1", country: "Vietnam", password: "123456" },
    { id: 2, username: "user2", fullname: "User 2", country: "Vietnam", password: "123456" },
    { id: 3, username: "user3", fullname: "User 3", country: "Vietnam", password: "123456" },
]);

const removeMember = (id) => {
    members.value = members.value.filter(member => member.id !== id);
};
</script>

<template>
    <AdminHeader />
    <div class="admin-member">
        <div class="admin-member-header">
            <h3>Users</h3>
        </div>
        <div class="admin-member-body">
            <table class="table">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Full Name</th>
                        <th>Country</th>
                        <th>Password</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="member in members" :key="member.id">
                        <td>{{ member.username }}</td>
                        <td>{{ member.fullname }}</td>
                        <td>{{ member.country }}</td>
                        <td>{{ member.password }}</td>
                        <td>
                            <button @click="removeMember(member.id)" class="delete-button">Xóa</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style>
.admin-member {
    display: flex;
    flex-direction: column;
    width: 90%;
    max-width: 1200px;
    margin: 20px auto;
    border-radius: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    background-color: #f8f9fa;
    padding: 20px;
    overflow: hidden;
}
.admin-member-header {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #007bff;
    color: white;
    border-radius: 15px 15px 0 0;
    padding: 15px;
    font-size: 20px;
    font-weight: bold;
}
.table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    background: white;
    border-radius: 10px;
    overflow: hidden;
}
.table th, .table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
}
.table th {
    background-color: #007bff;
    color: white;
}
.table tr:nth-child(even) {
    background-color: #f2f2f2;
}
.delete-button {
    background-color: red;
    color: white;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 5px;
    transition: 0.3s;
}
.delete-button:hover {
    background-color: darkred;
}
</style>
