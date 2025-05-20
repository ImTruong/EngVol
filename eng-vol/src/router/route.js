import {createRouter, createWebHistory} from "vue-router";
import Login from "@/pages/Login.vue";
import SignUp from "@/pages/SignUp.vue";
import User from "@/pages/User.vue";
import Fillgame from "@/pages/FillingGame.vue";
import FlashCard from "@/pages/FlashCardView.vue";
import YourLibrary from "@/pages/YourLibrary.vue";
import HomeView from "@/pages/HomeView.vue";
import Review from "@/pages/Review.vue";
import Statistics from "@/pages/Statistics.vue";
import AdminMember from "@/pages/AdminMember.vue";
import AdminClass from "@/pages/AdminClass.vue";
import Admin from "@/pages/Admin.vue";


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes:[
        {
            path: "/login",
            name: "login",
            component: Login
        },
        
        {
            path: "/",
            name: "home",
            component: HomeView
        },
        {
            path: "/signup",
            name: "signup",
            component: SignUp
        },
        {
            path: "/profile",
            name: "profile",
            component: User
        },
        {
            path: "/fillgame/:id",
            name: "fillgame",
            component: Fillgame
        },
        {
            path: "/review",
            name: "review",
            component: Review
        },
        {
            path: "/flashcard/:id",
            name: "flashcard",
            component: FlashCard
        },
        {
            path: "/statistics",
            name: "Statistics",
            component: Statistics
        },
        {
            path: "/library",
            name: "library",
            component: YourLibrary
        },
        {
            path: "/admin",
            name: "admin",
            component: AdminMember
        },
        {
            path: "/admin/class",
            name: "adminClass",
            component: AdminClass
        },
        {
            path: "/admin/set",
            name: "adminSet",
            component: Admin
        }
    ]
})

export default router