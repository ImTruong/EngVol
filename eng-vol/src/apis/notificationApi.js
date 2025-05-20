import axios from 'axios';

export const fetchNotifications = async (token) => {
    try {
        const response = await axios.get("/notification/user", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
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
        console.error('Error marking notification as read:', error);
        throw error;
    }
};