<script setup>
    import { ref, computed, onMounted } from 'vue';
    import axios from 'axios';
    import Header from "../components/Header.vue";
    import { useRouter } from 'vue-router'; 
    import { userRemindWord } from '@/apis/wordApi';

    const currentCard = ref(0);
    const isFlipped = ref(false);
    const totalCards = ref([]);
    const isCompleted = ref(false)
    const isLoading = ref(true);
    const router = useRouter()
    const token = localStorage.getItem('token');


    const fetchReviewCard = async () => {
        try {
            const response = await userRemindWord(token);
            totalCards.value = response;
        } catch (error) {
            if (error.response) {
                alert(`${error.response.data.message || 'An error occurred'}`);
            } else {
                alert(`Network or Axios error: ${error.message}`);
            }
        } finally {
            isLoading.value = false; // Đặt isLoading thành false sau khi gọi API xong
        }
    };

    const cardStatus = computed(() => `${currentCard.value + 1}/${totalCards.value.length}`);
    const nextCard = () => {
        if (currentCard.value + 1 >= totalCards.value.length) {
        isCompleted.value = true; // Đánh dấu là đã hoàn thành 
        } else {
        isFlipped.value = false;
        currentCard.value += 1;
        }
    };

    const toggleFlip = () => {
        isFlipped.value = !isFlipped.value;
    }
    const playAudio = () => {

        const audio = new Audio(totalCards.value[currentCard.value].audio);
        audio.play();
    }

    const submitRating = async (rating) => {
        try {
            // const currentWord = totalCards.value[currentCard.value];
            // const studySessionData = {
            //     wordId: currentWord.id,
            //     difficulty: rating
            // };
            // console.log(studySessionData);
            // const token = localStorage.getItem('token'); 
            // const config = {
            //     headers: {
            //         Authorization: `Bearer ${token}` // Thêm token vào header
            //     }
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
    const handleComplete = () => {
        router.push('/');
    };

    onMounted(() => {
        fetchReviewCard();
    });
</script>

<template>
    <Header></Header>
    <div class="flashcard-container" v-if="totalCards.length > 0"> 
        <div class="flashcard-header">
            <h2>Review</h2>
            <span>{{ cardStatus }}</span>
        </div>

        <div class="flashcard-content" @click="toggleFlip">
            <div class="flashcard">
                <div v-if="!isFlipped" class="flashcard-front">
                    <img v-if="!(totalCards[currentCard]?.image === null)" :src="totalCards[currentCard].image" alt="Flashcard Image" />
                    <p v-if="!(totalCards[currentCard]?.image === null)" >{{ totalCards[currentCard].word }}</p>
                    <h1 v-else>{{ totalCards[currentCard].word }}</h1>
                </div>
                <div v-else class="flashcard-back">
                    <p class="ipa">{{ totalCards[currentCard].ipa }}</p>
                    <p class="definition">{{ totalCards[currentCard].definition }}</p>
                    <div v-if="totalCards[currentCard].audio" class="audio-icon" @click.stop="playAudio">
                        <img v-if="!(totalCards[currentCard]?.audio === null)" src="../assets/speaker-icon.svg" alt="Speaker Icon" />
                    </div>                    
                    <p class="example">{{ totalCards[currentCard].example }}</p>
                    <!-- <audio v-if="!(totalCards[currentCard]?.audio === null)" :src="totalCards[currentCard].audio" @play="playAudio" controls></audio> -->
                </div>
            </div>    
        </div>
        <div class="flashcard-rating">
            <button @click="submitRating('Very Difficult')" class="rating-btn">Very Difficult</button>
            <button @click="submitRating('Difficult')" class="rating-btn">Difficult</button>
            <button @click="submitRating('Easy')" class="rating-btn">Easy</button>
            <button @click="submitRating('Very Easy')" class="rating-btn">Very Easy</button>
        </div>
        <div class="alert completed" v-if="isCompleted">
            <div class="message">
                <p>Completed!</p>
                <button @click="handleComplete">Go to Home</button>
            </div>
        </div>
    </div>
    <div v-else>
        <div class="alert no-cards" v-if="isLoading === false">
            <div class="message">
                <p>No cards available</p>
                <button @click="handleComplete">Go to Home</button>
            </div>
        </div>
    </div>
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
        /* height: 350px; */
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
        background-color: #f9f9f9;
        border: none;
        cursor: pointer;
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
        width: 100%; 
        max-height: 300px;
        object-fit: cover; 
        border-radius: 8px;
    }

    .flashcard p{
        margin: 20px;
        font-size: 20px;
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
        width: 100%;
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

    .flashcard-back img{
        height:25px;
        width: 30px;
    }

    .flashcard .definition{
        font-size: 30px;
    }

    .audio-icon{
        height: 20px;
    }

    .flashcard .example{
        font-size: 20px;
    }
    
    
    .alert {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }
    
    .alert .message {
        background-color: white;
        padding: 40px 50px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }
    
    .alert .message p {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 20px;
    }
    
    .alert .message button {
        padding: 15px 30px;
        background-color: #BDEDF5;
        color: rgb(0, 0, 0);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 18px;
    }
    
    .alert .message button:hover {
        background-color: #91e3df;
    }
    
    /* Tùy chỉnh cho thông báo "No cards available" */
    .no-cards .message p {
        color: #e66355; /* Màu đỏ */
    }
    
    /* Tùy chỉnh cho thông báo "Completed" */
    .completed .message p {
        color: #69cee0; /* Màu xanh */
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
