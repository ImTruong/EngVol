//fake data
import store from "@/store";
import setModule from "@/store/modules/setModule";
// end fake data

import axios from 'axios';

// Lấy nghĩa của từ
export const fetchWordAutomationData = async (word) => {
  try {
    const response = await axios.get(`/api/meaning/${word}`, {
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching meaning:', error);
    return null;
  }
};

// Thêm từ mới
export const createWord = async (wordData,token) => {
    console.log(wordData.setId)
  try {
    const response = await axios.post('word', wordData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
          console.log("Error message:", error.response.data.message);
          throw error.response.data.message;
      } else {
          console.log("Unexpected error:", error);
          throw new Error("Something went wrong");
      }
  }
//     const listSet = setModule.state().fakeDataListSet;
//     console.log (wordData.setId);
//     console.log (listSet)
//     const set = listSet.find(set => set.id === wordData.setId);
//     if(set){
//         store.commit('setModule/addWord', wordData);
//         return "Word added successfully";
//     } else {
//         throw new Error("Set not found");
//     }
};

// Cập nhật từ
export const updateWord = async (wordData,token) => {
  try {
    const response = await axios.put('word', wordData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
          console.log("Error message:", error.response.data.message);
          throw error.response.data.message;
      } else {
          console.log("Unexpected error:", error);
          throw new Error("Something went wrong");
      }
  }
//     const listSet = store.state.setModule.fakeDataSetList;
//     const set = listSet.find(set => set.setId === wordData.setId);
//     if(set){
//         store.commit('setModule/updateWord', wordData);
//         return "Word updated successfully";
//     } else {
//         throw new Error("Set not found");
//     }
};

export const deleteWord = async (wordId, token) => {
  try {
      const config = {
          headers: {
              Authorization: `Bearer ${token}`
          }
      };
      const response = await axios.delete(`/word/${wordId}`, config);
      return response.data;
  } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
          console.log("Error message:", error.response.data.message);
          throw error.response.data.message;
      } else {
          console.log("Unexpected error:", error);
          throw new Error("Something went wrong");
      }
  }
//     store.commit('setModule/deleteWord', wordId);
//     return "Word deleted successfully";
};

export const userRemindWord = async (token,page,size) => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page: page,
                size: size
            }
        };
        const response = await axios.get('/word/userCurrent', config);
        return response.data.data;
    }  catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error message:", error.response.data.message);
            throw error.response.data.message;
        } else {
            console.log("Unexpected error:", error);
            throw new Error("Something went wrong");
        }
    }
    // return [
    //         {
    //           "id": 101,
    //           "word": "test",
    //           "ipa": "/test/",
    //           "definition": "To be shown to be by test.",
    //           "example": "This is a test sentence.",
    //           "image": "http://res.cloudinary.com/dyzfar3j8/image/upload/v1740882608/kqdlyar52xncvpvix4sl.jpg",
    //           "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/test-uk.mp3"
    //         },
    //         {
    //           "id": 102,
    //           "word": "banana",
    //           "ipa": "/bəˈnæn.ə/",
    //           "definition": "A long curved fruit with a yellow skin and soft, sweet, white flesh inside.",
    //           "example": "He ate a ripe banana for breakfast.",
    //           "image": "https://carly.com.vn/media/1209/website-la-gi.jpg?anchor=center&mode=crop&rnd=132730833370930000",
    //           "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/web-us.mp3"
    //         }];
}
