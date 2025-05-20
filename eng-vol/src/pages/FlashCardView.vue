<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import { useStore } from 'vuex';
    import axios from 'axios';
    import Header from "../components/Header.vue";

    //
    const currentSet = ref({
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
              "word": "web",
              "ipa": "/wɛb/",
              "definition": "The World Wide Web.",
              "example": "im coding a web",
              "image": "https://carly.com.vn/media/1209/website-la-gi.jpg?anchor=center&mode=crop&rnd=132730833370930000",
              "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/web-us.mp3"
            },
          ],
          userDetailResponse:{
            "username": "admin",
            "fullName": "John Doe",
          }
        });
        //

    const store = useStore();
    const router = useRouter();
    const currentCard = ref(0);
    const isFlipped = ref(false);
    // const currentSet = computed(() => store.state.currentSet); 
    const totalCards = computed(() => currentSet.value ? currentSet.value.wordResponses.length : 0);    
    const cardStatus = computed(() => `${currentCard.value + 1}/${totalCards.value}`);
    
    const playAudio = () => {
        const audio = new Audio(currentSet.value.wordResponses[currentCard.value].audio);
        audio.play();
    }
    const nextCard = () => {
        if (currentCard.value < totalCards.value - 1) {
            isFlipped.value = false;
            currentCard.value += 1;
        } else {
            alert("Completed!");
            setTimeout(() => {
                router.push('/');
            }, 0);
        
        }
    };

    const toggleFlip = () => {
        isFlipped.value = !isFlipped.value;
    }

    const submitRating = async (rating) => {
        try {
            // const currentWord = currentSet.value.wordResponses[currentCard.value];
            // const studySessionData = {
            //     wordId: currentWord.id,
            //     difficulty: rating
            // };
            // console.log(studySessionData);
            // const token = localStorage.getItem('token'); 
            // const config = {
            // headers: {
            //     Authorization: `Bearer ${token}` // Thêm token vào header
            // }
            // }
            // // Make API request to log study session
            // const response = await axios.post('/study', studySessionData, config); // Replace with your actual API endpoint
            // console.log('Study session created:', studySessionData);
            // if (response.data.message) {
            //     console.log(response.data.message);
            // }
            nextCard();
        } catch (error) {
            if (error.response) {
                alert(`${error.response.data.message || 'An error occurred'}`);
            } else {
                alert(`Network or Axios error: ${error.message}`);
            }
        }
    };
    
</script>

<template>
    <Header></Header>
    <div class="flashcard-container" v-if="currentSet"> 
        <div class="flashcard-header">
            <h2>{{ currentSet.name }}</h2>
            <span>{{ cardStatus }}</span>
        </div>

        <div class="flashcard-content" @click="toggleFlip">
            <div class="flashcard">
                <div v-if="!isFlipped" class="flashcard-front">
                    <img v-if="!(currentSet.wordResponses[currentCard]?.image === null)" :src="currentSet.wordResponses[currentCard].image" alt="Flashcard Image" />
                    <p v-if="!(currentSet.wordResponses[currentCard]?.image === null)" >{{ currentSet.wordResponses[currentCard].word }}</p>
                    <h1 v-else>{{ currentSet.wordResponses[currentCard].word }}</h1>
                  </div>
                  <div v-else class="flashcard-back">
                    <p class="ipa">{{ currentSet.wordResponses[currentCard].ipa }}</p>
                    <p class="definition">{{ currentSet.wordResponses[currentCard].definition }}</p>
                    <div v-if="currentSet.wordResponses[currentCard].audio" class="audio-icon" @click.stop="playAudio">
                        <img v-if="!(currentSet.wordResponses[currentCard]?.audio === null)" src="../assets/speaker-icon.svg" alt="Speaker Icon" class="icon-play" />
                    </div>
                    <p class="example">{{ currentSet.wordResponses[currentCard].example }}</p>
                  </div>
            </div>    
        </div>
        <div class="flashcard-rating">
            <button @click="submitRating('Very Difficult')" class="rating-btn">Very Difficult</button>
            <button @click="submitRating('Difficult')" class="rating-btn">Difficult</button>
            <button @click="submitRating('Easy')" class="rating-btn">Easy</button>
            <button @click="submitRating('Very Easy')" class="rating-btn">Very Easy</button>
        </div>
    </div>
    <div v-else>Loading...</div> 
</template>

<style scoped>
    .flashcard-container {
        width: 600px; 
        margin: 40px auto;
        padding: 20px;
        text-align: center;
    }

    .flashcard-header {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        font-size: 1.2em;
    }

    .flashcard-content {
        width: 100%;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
        background-color: #f9f9f9;
        border: none;
    }

    .flashcard-front{
        width: 100%;
        max-width: 350px; 
        min-height: 200px;
        margin: 0 auto;
        text-align: center;
        align-content: center;
    }
    
    .flashcard img {
        max-width: 100%; /* Ảnh sẽ không vượt quá chiều rộng của flashcard */
        max-height: 300px;
        object-fit: cover; 
        border-radius: 8px;
    }

    .flashcard p{
        margin: 10px;
        font-size: 25px;
    }

    .flashcard-word {
        font-size: 1.5em;
        margin-top: 10px;
    }

    .flashcard-rating {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        gap: 10px;
    }

    .rating-btn {
        background-color: #DBF3F7;
        border: 1px solid #d3d3d3; 
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
        padding: 10px 0;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
        width: 100%; 
        text-align: center;
        font-size: 1em;
    }

    .rating-btn:hover {
        background-color: #91e3df;
    }
    .flashcard-content {
        perspective: 1000px; /* Tạo hiệu ứng 3D */
    }
    
    .flashcard-back{
        max-width: 500px; 
        min-height: 200px;
        align-content: center;
        /* margin: 40px auto; */
        /* padding: 20px; */
        text-align: center;
        /* font-size: 25px; */
    }

    .flashcard-back .ipa{
        font-size: 20px;
    }

    .flashcard .definition{
        font-size:25px;
        margin-bottom: 30px;
    }

    .flashcard .example{
        font-size: 20px;
    }

    .audio-icon{
        display: flex; 
        justify-content: center; 
        align-items: center; 
        width: 40px;
        height: 40px; 
        margin: 0 auto; 
    }
    .audio-btn {
        background-color: #4CAF50;
        color: white;
        padding: 10px;
        border: none;
        cursor: pointer;
    }
    .audio-btn:hover {
        background-color: #45a049;
    }
</style>
