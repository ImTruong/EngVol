import axios from "axios"

export const createStudySession = async (token, studySessionData) => {
    try{
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        const response = await axios.post('/study', studySessionData, config);
        return response.data;
    }catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
}

export const getStudySessionByTime = async (token,page,size) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page: page,
                size: size
            }
        }
        const response = await axios.get('/study/time', config);
        return response.data.data;
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

export const getStudySessionByWord = async (token,page,size) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page: page,
                size: size
            }
        }
        const response = await axios.get('/study/word', config);
        return response.data.data;
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

export const getStudySessionBySpecificWord = async (token, wordId, page,size) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page: page,
                size: size
            }
        }
        const response = await axios.get(`/study/word/${wordId}`, config);
        return response.data.data;
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

export const getStudySessionBySpecificTime = async (token, time, page, size) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page: page,
                size: size
            }
        }
        const response = await axios.get(`/study/time/${time}`, config);
        return response.data.data;
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