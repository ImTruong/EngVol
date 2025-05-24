// fake data
import userModule from "@/store/modules/userModule";
import store from "@/store";
// end fake data
import axios from "axios"

export const login = async (username,password) => {
    try {
        const response = await axios.post('user/login', {
            username,
            password,
        });

        if (response.status === 200) {
            return response.data.data;
        }

        throw new Error(response.data.message || "Login failed");
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message); // Ném lỗi lên trên
        } else {
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // const user = fakeDataUserList.find(user => user.username === username && user.password === password);
    // if(user)
    //     return "fakeToken";
    // else
    //     throw new Error("Invalid username or password");
}

export const register = async (registerRequest) => {
    try {
        const response = await axios.post('user/register', {
            fullName: registerRequest.fullname,
            username: registerRequest.username,
            password: registerRequest.password,
            email: registerRequest.email,
            country: registerRequest.country
        });
        return response.data.message;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // const user = fakeDataUserList.find(user => user.username === registerRequest.username || user.email === registerRequest.email);
    // if(user)
    //     throw new Error("Username or Email already exists");
    // else{
    //     store.dispatch('userModule/addUser', {
    //         username: registerRequest.username,
    //         email: registerRequest.email,
    //         password: registerRequest.password,
    //         fullName: registerRequest.fullname,
    //         country: registerRequest.country
    //     });
    //     return "Register successfully"
    // }
}

export const changePassword = async (changePasswordRequest,token) => {
    try {
        const response = await axios.put('user/password', changePasswordRequest, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        return response.data.message;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // const user = fakeDataUserList.find(user => user.username === "admin" && user.password === changePasswordRequest.currentPassword);
    // if(user){
    //     if (changePasswordRequest.newPassword !== changePasswordRequest.confirmPassword)
    //         throw new Error("New password and confirm password do not match");
    //     store.dispatch('userModule/changePassword', {
    //         password: changePasswordRequest.newPassword
    //     });
    //     return "Change password successfully";
    // }
    // else{
    //     throw new Error("Wrong old password");
    // }
}

export const updateUserInfo = async (updateUserInfoRequest,token) => {
    try {

        const response = await axios.put('user', updateUserInfoRequest, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.message;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // const user = fakeDataUserList.find(user => user.username === "admin");
    // if(user){
    //     store.dispatch('userModule/updateUserInfo', {
    //         email: updateUserInfoRequest.email,
    //         fullName: updateUserInfoRequest.fullName,
    //         country: updateUserInfoRequest.country
    //     });
    //     return "Update user info successfully";
    // }
    // else{
    //     throw new Error("Update user info failed");
    // }
}

export const getCurrentUser = async (token) => {
    try {
        const response = await axios.get('user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // const user = fakeDataUserList.find(user => user.username === "admin");
    // if(user)
    //     return user;
    // else
    //     throw new Error("Get user info failed");
};

export const getAllUsers = async (token,userName,email,page,size) => {
    try {
        const response = await axios.get('/admin/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                page: page,
                size: size,
                username: userName,
                email: email
            }
        });
        response.data.data.content.forEach((user) => {
            user.deleted = user.status == 0;
        })
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // return fakeDataUserList;
}

export const deleteUser = async (token,userId) => {
    try {
        const response = await axios.delete('/admin/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                userId: userId
            }
        });
        return response.data.message;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // store.dispatch('userModule/deleteUser', username);
    // return "Delete user successfully";
}

export const updateUserRole = async (token,userId,roleId) => {
    try {
        // Set default headers for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Use URLSearchParams for proper parameter formatting
        const params = new URLSearchParams();
        params.append('userId', userId);
        params.append('roleId', roleId);

        const response = await axios.put('/admin/user/role', params);
        return response.data.message;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // store.dispatch('userModule/updateUserRole', {
    //     username: username,
    //     role: role
    // });
    // return "Update user role successfully";
}

export const updateUserPassword = async (token,userId,password) => {
    try {
        // Using params in the correct location (in the config object)
        const response = await axios.put('/admin/user/password',
            // Empty body or null since we're using params
            {},
            // Config object with both headers and params
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    userId: Number(userId),
                    password: password
                }
            }
        );
        return response.data.message;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // const { fakeDataUserList } = store.state.userModule;
    // store.dispatch('userModule/updateUserPassword', {
    //     username: username,
    //     password: password
    // });
    // return "Update user password successfully";
}

export const reActivateUser = async (token,userId) => {
    try {
        const response = await axios.put('/admin/user/reActivate',
            {},
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                userId: userId
            }
            }
        );
        return response.data.message;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
}

export const getCurrentUserRole = async (token) => {
    try {
        const response = await axios.get('/user/role', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        // Trả về giá trị đúng - nằm trong response.data.data
        return response.data.data;
    } catch (error) {
        console.error("Lỗi khi lấy vai trò người dùng:", error);
        throw error;
    }
};

 