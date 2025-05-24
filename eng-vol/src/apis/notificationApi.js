import axios from 'axios';

export const fetchNotifications = async (token,page,size) => {
    try {
        const response = await axios.get("/notification/user", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page: page,
                size: size
            }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
};

export const editReadMode = async (notificationId, token) => {
    try {
        const response = await axios.put(`/notification/read?notificationId=${notificationId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            return error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
};