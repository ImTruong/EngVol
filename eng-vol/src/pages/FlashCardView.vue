<script setup>
import { ref, computed, onMounted, watch } from 'vue';  // Các hàm cần thiết từ Vue
import { useRouter } from 'vue-router';  // Để điều hướng trang
import { useStore } from 'vuex';  // Dùng Vuex store để quản lý trạng thái
import Header from "../components/Header.vue";  // Import Header component
import { createStudySession } from "@/apis/studyApi.js";  // API để tạo phiên học (study session)

const store = useStore();  // Khởi tạo Vuex store
const router = useRouter();  // Khởi tạo Vue Router

// Các reactive state
const currentCard = ref(0);  // Card hiện tại (mặc định là card đầu tiên)
const isFlipped = ref(false);  // Trạng thái card có bị lật hay không (mặt trước hay mặt sau)
const currentSet = computed(() => store.state.setModule.currentSet);  // Set học hiện tại từ Vuex store
const totalCards = computed(() => currentSet.value ? currentSet.value.wordResponses.length : 0);  // Tổng số thẻ trong set học
const cardStatus = computed(() => `${currentCard.value + 1}/${totalCards.value}`);  // Trạng thái hiển thị số thẻ hiện tại
const progress = computed(() => ((currentCard.value + 1) / totalCards.value) * 100);  // Tính toán tiến trình học (progres)


// Hàm phát âm thanh khi người dùng nhấn vào thẻ
const playAudio = () => {
  const audio = new Audio(currentSet.value.wordResponses[currentCard.value].audio);  // Tạo một đối tượng Audio từ link audio trong thẻ
  audio.play();  // Phát âm thanh
}

// Chuyển sang thẻ tiếp theo
const nextCard = () => {
  if (currentCard.value < totalCards.value - 1) {  // Nếu chưa đến thẻ cuối
    isFlipped.value = false;  // Đảm bảo là thẻ không bị lật
    currentCard.value += 1;  // Chuyển đến thẻ tiếp theo
  } else {
    alert("Completed!");  // Thông báo khi hoàn thành toàn bộ bộ thẻ
    setTimeout(() => {
      router.push('/');  // Điều hướng về trang chính sau khi hoàn thành
    }, 0);
  }
};

// Đảo ngược trạng thái lật thẻ
const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;  // Đổi trạng thái lật thẻ
}

// Gửi điểm đánh giá cho thẻ (Rating) và chuyển sang thẻ tiếp theo
const submitRating = async (rating) => {
  try {
    const currentWord = currentSet.value.wordResponses[currentCard.value];  // Lấy từ vựng hiện tại
    const studySessionData = {
      wordId: currentWord.id,  // ID của từ vựng
      difficulty: rating  // Đánh giá mức độ khó của từ vựng
    };
    const token = localStorage.getItem('token');  // Lấy token từ localStorage
    await createStudySession(token, studySessionData);  // Gọi API để tạo phiên học với dữ liệu
  } catch (error) {
    console.error("Error creating study session:", error);  // Xử lý lỗi
  }
  nextCard();  // Chuyển sang thẻ tiếp theo
};

// Quay lại thẻ trước
const previousCard = () => {
  if (currentCard.value > 0) {  // Nếu không phải thẻ đầu tiên
    isFlipped.value = false;  // Đảm bảo là thẻ không bị lật
    currentCard.value -= 1;  // Quay lại thẻ trước
  }
};

// Thao tác chuyển sang thẻ tiếp theo (có thể được dùng ở những nơi khác)
const nextCardNav = () => {
  if (currentCard.value < totalCards.value - 1) {  // Nếu chưa đến thẻ cuối
    isFlipped.value = false;  // Đảm bảo là thẻ không bị lật
    currentCard.value += 1;  // Chuyển đến thẻ tiếp theo
  }
};
</script>


<template>
  <Header></Header>
  <div class="flashcard-container" v-if="currentSet">
    <div class="flashcard-header">
      <div class="header-top">
        <button @click="previousCard" class="nav-btn" :disabled="currentCard === 0" :class="{ 'disabled': currentCard === 0 }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Previous
        </button>
        <h1 class="set-title">{{ currentSet.name }}</h1>
        <button @click="nextCardNav" class="nav-btn" :disabled="currentCard === totalCards - 1" :class="{ 'disabled': currentCard === totalCards - 1 }">
          Next
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"/>
            <path d="M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="card-counter">{{ cardStatus }}</span>
      </div>
    </div>

    <div class="flashcard-wrapper">
      <div class="flashcard-content" @click="toggleFlip" :class="{ 'flipped': isFlipped }">
        <div class="flashcard">
          <div class="flashcard-front">
            <div class="card-inner">
              <img v-if="!(currentSet.wordResponses[currentCard]?.image === null)"
                   :src="currentSet.wordResponses[currentCard].image"
                   alt="Flashcard Image"
                   class="card-image" />
              <h2 class="word-text" :class="{ 'word-only': currentSet.wordResponses[currentCard]?.image === null }">
                {{ currentSet.wordResponses[currentCard].word }}
              </h2>
              <div class="flip-hint">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
                <span>Click to flip</span>
              </div>
            </div>
          </div>

          <div class="flashcard-back">
            <div class="card-inner">
              <div class="pronunciation">
                <span class="ipa">{{ currentSet.wordResponses[currentCard].ipa }}</span>
                <button v-if="currentSet.wordResponses[currentCard].audio"
                        class="audio-btn"
                        @click.stop="playAudio"
                        title="Play pronunciation">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9v6h4l5 5V4L7 9H3z"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                </button>
              </div>

              <div class="definition">{{ currentSet.wordResponses[currentCard].definition }}</div>

              <div class="example" v-if="currentSet.wordResponses[currentCard].example">
                <span class="example-label">Example:</span>
                <span class="example-text">{{ currentSet.wordResponses[currentCard].example }}</span>
              </div>

              <div class="flip-hint">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
                <span>Click to flip back</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rating-section">
      <h3 class="rating-title">How well do you know this word?</h3>
      <div class="flashcard-rating">
        <button @click="submitRating('Very Difficult')" class="rating-btn very-difficult">
          <span class="rating-emoji">😰</span>
          <span>Very Difficult</span>
        </button>
        <button @click="submitRating('Difficult')" class="rating-btn difficult">
          <span class="rating-emoji">😕</span>
          <span>Difficult</span>
        </button>
        <button @click="submitRating('Easy')" class="rating-btn easy">
          <span class="rating-emoji">🙂</span>
          <span>Easy</span>
        </button>
        <button @click="submitRating('Very Easy')" class="rating-btn very-easy">
          <span class="rating-emoji">😎</span>
          <span>Very Easy</span>
        </button>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <div class="loading-spinner"></div>
    <p>Loading flashcards...</p>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.flashcard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 100px; /* Add space for header */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.flashcard-header {
  text-align: center;
  margin-bottom: 25px;
  color: white;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 20px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-size: 0.9rem;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.set-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  flex: 1;
  text-align: center;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

.progress-bar {
  flex: 1;
  max-width: 250px;
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.card-counter {
  font-size: 1rem;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
  padding: 6px 12px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.flashcard-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
  flex: 1;
  align-items: center;
}

.flashcard-content {
  width: 100%;
  max-width: 420px;
  height: 300px;
  perspective: 1000px;
  cursor: pointer;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flashcard-content.flipped .flashcard {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  background: white;
  overflow: hidden;
}

.flashcard-back {
  transform: rotateY(180deg);
}

.card-inner {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
}

.card-image {
  max-width: 100%;
  max-height: 120px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}

.word-text {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.word-text.word-only {
  font-size: 2.2rem;
}

.pronunciation {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
}

.ipa {
  font-size: 1.1rem;
  font-weight: 500;
  font-family: 'Times New Roman', serif;
}

.audio-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.audio-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.definition {
  font-size: 1.1rem;
  line-height: 1.5;
  color: #2d3748;
  margin-bottom: 15px;
  font-weight: 500;
}

.example {
  background: #f7fafc;
  padding: 10px 15px;
  border-radius: 12px;
  border-left: 3px solid #667eea;
  margin-bottom: 15px;
  text-align: left;
  width: 100%;
  font-size: 0.9rem;
}

.example-label {
  font-weight: 600;
  color: #667eea;
  display: block;
  margin-bottom: 3px;
  font-size: 0.8rem;
}

.example-text {
  font-style: italic;
  color: #4a5568;
  line-height: 1.4;
}

.flip-hint {
  position: absolute;
  bottom: 10px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #a0aec0;
  font-size: 0.8rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.flashcard-content:hover .flip-hint {
  opacity: 1;
}

.rating-section {
  text-align: center;
}

.rating-title {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.flashcard-rating {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.rating-btn {
  background: white;
  border: none;
  padding: 12px 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.rating-emoji {
  font-size: 1.2rem;
}

.very-difficult {
  color: #e53e3e;
}

.difficult {
  color: #ff8c00;
}

.easy {
  color: #38a169;
}

.very-easy {
  color: #3182ce;
}

.rating-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.very-difficult:hover {
  background: linear-gradient(135deg, #fed7d7, #feb2b2);
}

.difficult:hover {
  background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
}

.easy:hover {
  background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
}

.very-easy:hover {
  background: linear-gradient(135deg, #bee3f8, #90cdf4);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .flashcard-container {
    padding: 15px;
    padding-top: 80px;
  }

  .header-top {
    flex-direction: column;
    gap: 10px;
  }

  .nav-btn {
    font-size: 0.8rem;
    padding: 8px 12px;
  }

  .set-title {
    font-size: 1.4rem;
  }

  .flashcard-content {
    height: 280px;
    max-width: 350px;
  }

  .card-inner {
    padding: 15px;
  }

  .word-text {
    font-size: 1.5rem;
  }

  .word-text.word-only {
    font-size: 1.8rem;
  }

  .flashcard-rating {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .rating-btn {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .progress-section {
    flex-direction: column;
    gap: 8px;
  }

  .progress-bar {
    width: 100%;
  }

  .flashcard-rating {
    grid-template-columns: 1fr;
  }

  .nav-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (min-height: 800px) {
  .flashcard-container {
    justify-content: space-evenly;
  }
}

.nav-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn.disabled:hover {
  background: rgba(255,255,255,0.2);
  transform: none;
}
</style>