<script setup>
import { ref } from 'vue';
import AdminHeader from '@/components/AdminHeader.vue';

const members = ref([
    {
        id: 1,
        setName: "Set 1",
        description: "This is set 1",
        ownerUsername: "user1",
        privacy: "Public",
        words: [
            {
                id: 1,
                word: "Apple",
                meaning: "Quả táo",
                example: "This is an apple",
            },
            {
                id: 2,
                word: "Banana",
                meaning: "Quả chuối",
                example: "This is a banana",
            },
        ],
    },
    {
        id: 2,
        setName: "Set 2",
        description: "This is set 2",
        ownerUsername: "user2",
        privacy: "Private",
        words: [
            {
                id: 3,
                word: "Cat",
                meaning: "Con mèo",
                example: "This is a cat",
            },
            {
                id: 4,
                word: "Dog",
                meaning: "Con chó",
                example: "This is a dog",
            },
        ],
    }
]);

const removeMember = (id) => {
    members.value = members.value.filter(member => member.id !== id);
};
</script>

<template>
    <AdminHeader />
    <div class="admin-member">
        <div class="admin-member-header">
            <h3>Classes</h3>
        </div>
        <div class="admin-member-body">
            <table class="table">
                <thead>
                    <tr>
                        <th>Set Name</th>
                        <th>Description</th>
                        <th>Word List</th>
                        <th>Owner</th>
                        <th>Privacy</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="member in members" :key="member.id">
                        <td>{{ member.setName }}</td>
                        <td>{{ member.description }}</td>
                        <td>
                            <ul>
                                <li v-for="word in member.words" :key="word.id">
                                    <div>
                                        <strong>{{ word.word }}</strong>
                                        <p>{{ word.meaning }}</p>
                                        <p>{{ word.example }}</p>
                                    </div>
                                </li>
                            </ul>
                        </td>
                        <td>{{ member.ownerUsername }}</td>
                        <td>{{ member.privacy }}</td>
                        <td>
                            <button @click="removeMember(member.id)" class="delete-button">Delete</button>
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
