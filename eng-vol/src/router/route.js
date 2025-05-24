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
import Admin from "@/pages/Admin.vue";
import Unauthorized from "@/pages/Unauthorized.vue";
import { getCurrentUserRole } from "@/apis/userApi.js";


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
            path: "/management",
            name: "management",
            component: Admin,
            meta: {
                requiresAuth: true,
                requiresAdmin: true
            }
        },
        {
            path: "/unauthorized",
            name: "unauthorized",
            component: Unauthorized
        }
    ]
})

// Navigation Guard - kiểm tra trước khi chuyển hướng
router.beforeEach(async (to, from, next) => {
    // Kiểm tra xem route có yêu cầu xác thực không
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // Kiểm tra token đăng nhập
        const token = localStorage.getItem('token')

        if (!token) {
            // Nếu không có token, chuyển hướng đến trang đăng nhập
            next({
                path: '/login',
                query: { redirect: to.fullPath }  // Lưu lại đường dẫn để chuyển hướng sau khi đăng nhập
            })
            return
        }

        // Nếu route yêu cầu quyền admin
        if (to.matched.some(record => record.meta.requiresAdmin)) {
            try {
                // Lấy thông tin về vai trò của người dùng
                const userRole = await getCurrentUserRole(token)

                // Hoặc kiểm tra từ API (giả sử bạn có một hàm checkIsAdmin)
                // const isAdmin = await checkIsAdmin(token)

                if (userRole == 'ADMIN') {
                    // Nếu là admin, cho phép truy cập
                    next()
                } else {
                    // Nếu không phải admin, chuyển hướng về trang không có quyền
                    next({ path: '/unauthorized' })
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra quyền admin:', error)
                next({ path: '/login' })
            }
        } else {
            // Nếu route chỉ yêu cầu đăng nhập (không yêu cầu quyền admin)
            next()
        }
    } else {
        // Nếu route không yêu cầu xác thực, cho phép truy cập
        next()
    }
})

export default router