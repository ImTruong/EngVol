<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"; // Import các hàm và biến reactive từ Vue
import { useStore } from 'vuex'; // Import Vuex để quản lý trạng thái
import Header from '../components/Header.vue'; // Import component Header
import { useRouter } from 'vue-router'; // Import router để điều hướng giữa các trang

const store = useStore(); // Khởi tạo store để truy cập trạng thái toàn cục
const router = useRouter(); // Khởi tạo router để điều hướng

// Lấy bộ từ hiện tại từ trạng thái Vuex
const currentSet = computed(() => store.state.setModule.currentSet);

// Tính tổng số thẻ từ trong bộ từ hiện tại
const totalCards = computed(() => currentSet.value ? currentSet.value.wordResponses.length : 0);

// Biến reactive để lưu trạng thái thẻ từ hiện tại
const currentCard = ref(0); // Chỉ số thẻ từ hiện tại
const userInput = ref(""); // Lưu nội dung người dùng nhập
const feedback = ref(""); // Lưu phản hồi sau khi kiểm tra câu trả lời
const answer = ref(false); // Trạng thái hiển thị đáp án
const isCorrect = ref(null); // Trạng thái đúng/sai của câu trả lời
const isAnimating = ref(false); // Trạng thái hiệu ứng khi trả lời

// Hiển thị từ với các ký tự đã nhập hoặc dấu gạch dưới
const displayWord = computed(() => {
  if (!currentSet.value || !currentSet.value.wordResponses[currentCard.value]) return "";
  const currentWord = currentSet.value.wordResponses[currentCard.value];
  const targetWord = currentWord.word;

  return targetWord
      .split("")
      .map((char, index) => {
        if (index < userInput.value.length) {
          const userChar = userInput.value[index];
          if (char.toLowerCase() === userChar.toLowerCase()) {
            return char; // Hiển thị ký tự đúng
          } else {
            return userChar; // Hiển thị ký tự người dùng đã nhập (dù đúng hay sai)
          }
        } else {
          return char === " " ? " " : "_"; // Giữ nguyên dấu cách, ẩn ký tự khác
        }
      })
      .join("");
});

// Xử lý sự kiện nhấn phím
const handleKeydown = (event) => {
  const targetWord = currentSet.value.wordResponses[currentCard.value].word;

  if (/^[a-zA-Z ]$/.test(event.key) && userInput.value.length < targetWord.length) {
    userInput.value += event.key; // Thêm ký tự vào input
  } else if (event.key === "Backspace") {
    userInput.value = userInput.value.slice(0, -1); // Xóa ký tự cuối cùng
  } else if (event.key === "Enter") {
    checkAnswer(); // Kiểm tra câu trả lời khi nhấn Enter
  }
};

// Kiểm tra câu trả lời của người dùng
const checkAnswer = () => {
  const targetWord = currentSet.value.wordResponses[currentCard.value].word;
  if (userInput.value.toLowerCase() === targetWord.toLowerCase()) {
    feedback.value = "Correct! 🎉"; // Phản hồi đúng
    isCorrect.value = true; // Đánh dấu câu trả lời đúng
    isAnimating.value = true; // Bật hiệu ứng
    setTimeout(() => isAnimating.value = false, 600); // Tắt hiệu ứng sau 600ms
  } else {
    feedback.value = "Incorrect! Try again 🤔"; // Phản hồi sai
    isCorrect.value = false; // Đánh dấu câu trả lời sai
    isAnimating.value = true; // Bật hiệu ứng
    setTimeout(() => isAnimating.value = false, 600); // Tắt hiệu ứng sau 600ms
  }
};

// Chuyển về thẻ từ trước đó
const prevCard = () => {
  if (currentCard.value > 0) {
    resetCardState(); // Đặt lại trạng thái thẻ từ
    currentCard.value -= 1; // Giảm chỉ số thẻ từ
  }
};

// Chuyển sang thẻ từ tiếp theo
const nextCard = () => {
  if (isCorrect.value !== true) {
    return; // Chỉ cho phép chuyển khi trả lời đúng
  }

  if (currentCard.value < totalCards.value - 1) {
    resetCardState(); // Đặt lại trạng thái thẻ từ
    currentCard.value += 1; // Tăng chỉ số thẻ từ
  } else {
    feedback.value = "Well done! All cards completed! 🌟"; // Phản hồi hoàn thành tất cả thẻ từ
    setTimeout(() => {
      alert("Well done! 🌟"); // Hiển thị thông báo
      router.push('/'); // Điều hướng về trang chính
    }, 1000);
  }
};

// Đặt lại trạng thái thẻ từ
const resetCardState = () => {
  userInput.value = ""; // Xóa nội dung nhập
  feedback.value = ""; // Xóa phản hồi
  isCorrect.value = null; // Đặt lại trạng thái đúng/sai
  answer.value = false; // Ẩn đáp án
};

// Phát âm thanh của từ hiện tại
const playAudio = () => {
  const audio = new Audio(currentSet.value.wordResponses[currentCard.value].audio);
  audio.play().catch(e => console.log('Audio play failed:', e)); // Xử lý lỗi nếu không phát được âm thanh
};

// Hiển thị hoặc ẩn đáp án
const showAnswer = () => {
  answer.value = !answer.value; // Đảo trạng thái hiển thị đáp án
};

// Xử lý khi component được mount
onMounted(() => {
  if (currentSet.value?.wordResponses) {
    currentSet.value.wordResponses = currentSet.value.wordResponses.sort(() => Math.random() - 0.5); // Xáo trộn danh sách thẻ từ
  }
  window.addEventListener("keydown", handleKeydown); // Lắng nghe sự kiện nhấn phím
});

// Xử lý khi component bị unmount
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown); // Gỡ bỏ sự kiện nhấn phím
});
</script>

<template>
  <div class="game-container">
    <Header style="position: absolute; top: 0; left: 0; right: 0; z-index: 10;"></Header>

    <!-- Word Display Card -->
    <div class="word-card" :class="{ 'animate-bounce': isAnimating && isCorrect, 'animate-shake': isAnimating && isCorrect === false }">
      <div class="word-display">
        <p class="display-word">{{ answer ? currentSet.wordResponses[currentCard].word : displayWord }}</p>
        <button
            v-if="currentSet.wordResponses[currentCard]?.audio"
            class="audio-button"
            @click="playAudio"
            aria-label="Play pronunciation"
        >
          <svg class="speaker-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="controls">
      <button class="btn btn-primary" @click="checkAnswer">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        Check
      </button>
      <button class="btn btn-secondary" @click="showAnswer">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        {{ answer ? 'Hide' : 'Show' }} Answer
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${((currentCard + 1) / totalCards) * 100}%` }"></div>
      </div>
      <div class="progress-text">{{ currentCard + 1 }} / {{ totalCards }}</div>
    </div>

    <!-- Card Content -->
    <div class="card-container">
      <button
          class="nav-button nav-button-prev"
          @click="prevCard"
          :disabled="currentCard === 0"
          aria-label="Previous card"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>

      <div class="content-card">
        <div v-if="currentSet.wordResponses[currentCard]?.image" class="image-container">
          <img
              :src="currentSet.wordResponses[currentCard].image"
              :alt="currentSet.wordResponses[currentCard].word"
              class="card-image"
          />
        </div>

        <div class="card-details">
          <div class="detail-item">
            <span class="detail-label">IPA:</span>
            <span class="detail-value">{{ currentSet.wordResponses[currentCard].ipa }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Definition:</span>
            <span class="detail-value">{{ currentSet.wordResponses[currentCard].definition }}</span>
          </div>
        </div>
      </div>

      <button
          class="nav-button nav-button-next"
          @click="nextCard"
          :disabled="isCorrect !== true"
          aria-label="Next card"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Feedback -->
    <transition name="feedback">
      <div v-if="feedback" :class="['feedback', { 'feedback-correct': isCorrect, 'feedback-incorrect': isCorrect === false }]">
        {{ feedback }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.word-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 320px;
  transition: all 0.3s ease;
}

.word-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.word-display {
  position: relative;
  text-align: center;
}

.display-word {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #2d3748;
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  line-height: 1.2;
}

.audio-button {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.audio-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.speaker-icon {
  width: 20px;
  height: 20px;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #fa709a, #fee140);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(250, 112, 154, 0.4);
}

.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 400px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.6);
}

.progress-text {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.card-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 800px;
  flex: 1;
  min-height: 0;
}

.content-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  max-height: 300px;
  overflow-y: auto;
}

.image-container {
  margin-bottom: 1rem;
}

.card-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.card-image:hover {
  transform: scale(1.05);
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.detail-label {
  font-weight: 700;
  color: #667eea;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  color: #2d3748;
  font-size: 1.1rem;
  line-height: 1.5;
}

.nav-button {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.nav-button:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.nav-button svg {
  width: 24px;
  height: 24px;
}

.feedback {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  margin-top: 1rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.feedback-correct {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.feedback-incorrect {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

/* Animations */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.animate-bounce {
  animation: bounce 0.6s ease-in-out;
}

.animate-shake {
  animation: shake 0.6s ease-in-out;
}

.feedback-enter-active, .feedback-leave-active {
  transition: all 0.5s ease;
}

.feedback-enter-from, .feedback-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .game-container {
    padding: 0 0.5rem;
    margin-top: 1rem;
  }

  .word-card {
    padding: 1.5rem;
    min-width: 280px;
  }

  .controls {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 280px;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .card-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-button {
    position: static;
    width: 60px;
    height: 60px;
  }

  .content-card {
    padding: 1.5rem;
    width: 100%;
  }

  .detail-item {
    padding: 0.75rem;
  }

  .nav-button-prev {
    order: -1;
  }

  .nav-button-next {
    order: 1;
  }
}

@media (max-width: 480px) {
  .display-word {
    font-size: 1.5rem;
    letter-spacing: 0.1em;
  }

  .word-card {
    padding: 1rem;
    min-width: 260px;
  }

  .content-card {
    padding: 1rem;
  }
}
</style>