import { set } from "date-fns";

const state = function() {
    return{
      sets: [],
      currentSet: null,
      fakeDataListSet: [
        {
          "id": 1,
          "name": "Basic Vocabulary",
          "description": "A set of common English words for beginners.",
          "privacyStatus": "class",
          "classId": 1,
          "numberOfWords": 2,
          "wordResponses": [
            {
              "id": 101,
              "word": "test",
              "ipa": "/test/",
              "definition": "To be shown to be by test.",
              "example": "This is a test sentence.",
              "image": "http://res.cloudinary.com/dyzfar3j8/image/upload/v1740882608/kqdlyar52xncvpvix4sl.jpg",
              "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/test-uk.mp3"
            },
            {
              "id": 102,
              "word": "banana",
              "ipa": "/bəˈnæn.ə/",
              "definition": "A long curved fruit with a yellow skin and soft, sweet, white flesh inside.",
              "example": "He ate a ripe banana for breakfast.",
              "image": "https://carly.com.vn/media/1209/website-la-gi.jpg?anchor=center&mode=crop&rnd=132730833370930000",
              "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/web-us.mp3"
            },
          ],
          userDetailResponse:{
            "username": "admin",
            "fullName": "John Doe",
          }
        },
        {
          "id": 2,
          "name": "Advanced Vocabulary",
          "description": "A collection of advanced words for fluent speakers.",
          "privacyStatus": "private",
          "numberOfWords": 3,
          "wordResponses": [
            {
              "id": 201,
              "word": "ephemeral",
              "ipa": "/ɪˈfem.ər.əl/",
              "definition": "Lasting for only a short time.",
              "example": "The beauty of a sunset is ephemeral.",
              "image": "https://example.com/ephemeral.jpg",
              "audio": "https://example.com/ephemeral.mp3"
            },
            {
              "id": 202,
              "word": "serendipity",
              "ipa": "/ˌser.ənˈdɪp.ɪ.ti/",
              "definition": "The occurrence of events by chance in a happy or beneficial way.",
              "example": "Meeting her at the bookstore was pure serendipity.",
              "image": "https://example.com/serendipity.jpg",
              "audio": "https://example.com/serendipity.mp3"
            },
            {
              "id": 203,
              "word": "quintessential",
              "ipa": "/ˌkwɪn.tɪˈsen.ʃəl/",
              "definition": "Representing the most perfect or typical example of something.",
              "example": "She is the quintessential leader.",
              "image": "https://example.com/quintessential.jpg",
              "audio": "https://example.com/quintessential.mp3"
            }
          ],
          userDetailResponse:{
            "username": "user",
            "fullName": "Alice Smith",
          }
        }
      ]
          
    }
}

const mutations = {
    addWord(state, wordData){
        const set = state.fakeDataListSet.find(set => set.id === wordData.setId);
        set.wordResponses.push(wordData);
        set.numberOfWords++;
    },
    updateWord(state, wordData){
        const set = state.fakeDataListSet.find(set => set.id === wordData.setId);
        const word = set.wordResponses.find(word => word.id === wordData.wordId);
        word.word = wordData.word;
        word.ipa = wordData.ipa;
        word.definition = wordData.definition;
        word.example = wordData.example;
        word.image = wordData.image;
        word.audio = wordData.audio;
    },
    deleteWord(state, wordId){
        const set = state.fakeDataListSet.find(set => set.wordResponses.find(word => word.id === wordId));
        const wordIndex = set.wordResponses.findIndex(word => word.id === wordId);
        set.wordResponses.splice(wordIndex, 1);
        set.numberOfWords--;
    },
    addOrUpdateSet(state,{ payload, isEditMode }){
      if(isEditMode){
        const setIndex = state.fakeDataListSet.findIndex(set => set.id === payload.setId);
        state.fakeDataListSet[setIndex].name = payload.name;
        state.fakeDataListSet[setIndex].description = payload.description;
        state.fakeDataListSet[setIndex].privacyStatus = payload.privacyStatus;
        state.fakeDataListSet[setIndex].classId = payload.classId;
      }else {
        const newId = state.fakeDataListSet.length > 0 
            ? Math.max(...state.fakeDataListSet.map(set => set.id)) + 1 
            : 1;

        const userDetailResponse = {
            "username": "admin",
            "email": "john.doe@example.com",
            "fullName": "John Doe",
            "country": "USA"
        };


        const newSet = { ...payload, id: newId, userDetailResponse: userDetailResponse, wordResponses: [] }; 
        state.fakeDataListSet.push(newSet);

        return newSet; 
      }
    },
    delete(state,setId){
      const setIndex = state.fakeDataListSet.findIndex(set => set.id === setId);
      state.fakeDataListSet.splice(setIndex, 1);
    },
    //real 
    setCurrentSet(state, set) {
      state.currentSet = set;
    }
}

const actions = {
    addWord({commit}, wordData){
        commit('addWord', wordData);
    },
    updateWord({commit}, wordData){
        commit('updateWord', wordData);
    },
    deleteWord({commit}, wordId){
        commit('deleteWord', wordId);
    },
    addOrUpdateSet({ commit, state }, { payload, isEditMode }) {
      commit('addOrUpdateSet', { payload, isEditMode });

      if (isEditMode) {
          return state.fakeDataListSet.find(set => set.id === payload.setId);
      } else {
          return state.fakeDataListSet[state.fakeDataListSet.length - 1]; // Lấy phần tử vừa thêm
      }
    },
    deleteSet({commit}, setId){
        commit('delete', setId);
    },
    fetchLibrarySets(context, token){
        context.state.sets = context.state.fakeDataListSet.filter(set => set.userDetailResponse.username == "admin");
    },
    //real
    setCurrentSet({ commit }, set) {
      commit('setCurrentSet', set);
    }
}

const getters = {
    getCurrentSet: state => state.currentSet,
    getSets: state => state.sets,
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}