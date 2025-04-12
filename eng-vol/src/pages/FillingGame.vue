<script setup>
    import { ref, computed, onMounted, onUnmounted } from "vue";
    import {useStore} from 'vuex';
    import Header from '../components/Header.vue';
    import { useRouter } from 'vue-router';

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
    // const currentSet = ref(null); 
    const totalCards = computed(() => currentSet.value ? currentSet.value.wordResponses.length : 0);
    const currentCard = ref(0)
    const userInput = ref("");
    const feedback = ref("");
    const answer = ref(false)
    const isCorrect = ref(null); 
    const displayWord = computed(() => {
      if (!currentSet.value || !currentSet.value.wordResponses[currentCard.value]) return "";
      const currentWord = currentSet.value.wordResponses[currentCard.value];
      return currentWord.word
        .split("")
        .map((char, index) => {
            if (index < userInput.value.length) {
            if (char.toLowerCase() === userInput.value[index]?.toLowerCase()) {
            return char; // Hiển thị ký tự đúng
            } else {
            return userInput.value[index]; // Hiển thị ký tự người dùng đã nhập (dù đúng hay sai)
            }
        } else if (char === " ") {
            return " "; // Giữ khoảng trắng
        } else {
            return "_"; // Ký tự ẩn
        }
        })
        .join(" ");
    });

    const handleKeydown = (event) => {
    if (/^[a-zA-Z ]$/.test(event.key)) {
        userInput.value += event.key; // Thêm ký tự vừa nhập
    } else if (event.key === "Backspace") {
        userInput.value = userInput.value.slice(0, -1);
    } else if (event.key === "Enter") {
        console.log(userInput.value)
        checkAnswer();
    }
    };
    // Kiểm tra đáp án
    const checkAnswer = () => {
    if (userInput.value.toLowerCase() === currentSet.value.wordResponses[currentCard.value].word.toLowerCase()) {
        feedback.value = "Correct!";
        isCorrect.value = true;
    } else {
        feedback.value = "Incorrect! Try again.";
        isCorrect.value = false;
    }
    };
    const prevCard = () => {
      if (currentCard.value > 0) {
        userInput.value = "";
        feedback.value = "";
        isCorrect.value = null;
        currentCard.value -= 1;
        answer.value = false; // Đặt lại trạng thái hiện đáp án
      }
    };
//     // Chuyển sang thẻ tiếp theo
    const nextCard = () => {
      if(feedback.value === "Incorrect! Try again."){
        userInput.value = "";
        return;
      }
      if (currentCard.value < totalCards.value - 1) {
        userInput.value = "";
        feedback.value = "";
        isCorrect.value = null;
        currentCard.value += 1;
        answer.value = false;
      } else {
          if(feedback.value === "Correct!"){
            feedback.value = "Well done! 🎉";
            alert("Well done! 🎉");
            router.push('/'); 
          }
      }
  };

  const playAudio = () => {
      const audio = new Audio(currentSet.value.wordResponses[currentCard.value].audio);
      audio.play();
  };
  const showAnswer = () => {
    answer.value = !answer.value;
  }

  onMounted(() => {
    // console.log("test")
    // currentSet.value = computed(() => store.getters['setModule/currentSet']);
    // console.log(currentSet.value);
    currentSet.value.wordResponses = currentSet.value.wordResponses.sort(() => Math.random() - 0.5);
    window.addEventListener("keydown", handleKeydown);
  });
  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
</script>


<template>
    <Header></Header>
    <div class="game-container">
        <!-- Hiển thị từ -->
        <div class="card">
          <p class="display-word">{{ answer ? currentSet.wordResponses[currentCard].word : displayWord }}</p>
          <img class="speaker-icon" v-if="!(currentSet.wordResponses[currentCard]?.audio === null)" src="../assets/speaker-icon.svg" @click="playAudio"/>
          <!-- <button class="audio-button" @click="playAudio">🔊</button> -->
        </div>
        <div class="controls">
          <button class="check-button" @click="checkAnswer">Check</button>
          <button class="answer-button" @click="showAnswer">Answer</button>
      </div>
        <!-- Tiến độ -->
        <div class="progress">
            {{ currentCard + 1 }}/{{ totalCards }}
        </div>
        <div class="card-container">
          <img src="../assets/previous_card.svg" class="icon-button prev-button" @click="prevCard" :disabled="currentCard === 0"></img>
            <img v-if="!(currentSet.wordResponses[currentCard]?.image === null)" :src="currentSet.wordResponses[currentCard].image" :alt="currentSet.wordResponses[currentCard].word" class="card-image" />
            <p>IPA: {{ currentSet.wordResponses[currentCard].ipa }}</p>
            <p>Definition: {{ currentSet.wordResponses[currentCard].definition }}</p>
          <img src="../assets/next_card.svg" class="icon-button next-button" @click="nextCard" :disabled="currentCard === totalCards - 1"></img>
        </div>
        <div v-if="feedback" :class="['feedback', { correct: isCorrect, incorrect: isCorrect === false }]">
            {{ feedback }}
        </div>
        
    </div>
</template>

<style scoped>
  .game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 60px;
    font-family: Arial, sans-serif;
  }
  .card-container {
    position: relative;
    margin: 20px auto;
    max-width: 400px;
    text-align: center;
  }

  .card-image {
      width: 80%;
      height: auto;
      margin-bottom: 20px;
  }

  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    width: 400px;
    background-color: white;
    position: relative;
  }

  .display-word {
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 3px;
  }
  

  .speaker-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    height: 15px;
    cursor: pointer;
    background: none;
    border: none;
  }
  .icon-button {
    position: absolute;
    top: 50%; /* Căn giữa nút theo chiều dọc */
    transform: translateY(-50%); /* Dịch chuyển để nút nằm chính giữa chiều dọc */
    background-color: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #555;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-button:hover {
    color: #333;
    background-color: rgba(0, 0, 0, 0.1); /* Hiệu ứng hover */
    border-radius: 50%; /* Làm nút tròn */
  }
  
  .icon-button:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
  
  .prev-button {
    left: -70px; /* Đặt ở ngoài bên trái game-container */
  }
  
  .next-button {
    right: -70px; /* Đặt ở ngoài bên phải game-container */
  }
  .progress {
    margin-top: 10px;
    font-size: 14px;
    color: #555;
  }

  .input-container {
    margin-top: 20px;
    width: 80%;
    display: flex;
    justify-content: center;
  }

  .word-input {
    width: 300px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;       
    font-size: 16px;
  }

  .controls {
    display: flex;
    justify-content: center; /* Căn giữa */
    gap: 10px; /* Khoảng cách giữa các nút */
    margin-top: 20px;
}

.check-button, .answer-button {
    background-color: #84dded; /* Màu xanh nổi bật */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease; /* Hiệu ứng hover */
}

.check-button:hover {
    background-color: #95ccd5;
}

.answer-button {
    background-color: #FF9FA8; /* Màu vàng */
}

.answer-button:hover {
    background-color: #bb7279;
}

  .feedback {
    margin-top: 5px;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
  }

  .feedback.correct {
    color: green;
  }

  .feedback.incorrect {
    color: red;
  }
</style>