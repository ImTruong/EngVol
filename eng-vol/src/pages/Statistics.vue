<script setup>
// Import các thành phần và thư viện cần thiết
import Header from '@/components/Header.vue';
import { ref, onMounted, computed } from 'vue';
import { getStudySessionByTime, getStudySessionByWord, getStudySessionBySpecificWord, getStudySessionBySpecificTime } from "@/apis/studyApi.js";

// Khởi tạo trạng thái cho tab và dữ liệu
const activeTab = ref('By Time'); // Tab hiện tại
const data = ref([]); // Dữ liệu hiển thị
const singleItemMode = ref(false); // Chế độ xem chi tiết
const singleItemHeader = ref(''); // Tiêu đề của chế độ xem chi tiết
const token = localStorage.getItem('token'); // Lấy token từ localStorage

// Trạng thái phân trang
const currentPage = ref(0); // Trang hiện tại
const pageSize = ref(20); // Số lượng phần tử trên mỗi trang
const totalPages = ref(0); // Tổng số trang
const totalElements = ref(0); // Tổng số phần tử

// Trạng thái thống kê
const todayStats = ref({
  wordsStudied: 0, // Số từ đã học hôm nay
  totalReviews: 0, // Tổng số lần ôn tập
  averageDifficulty: 0 // Độ khó trung bình
});

const weeklyStats = ref({
  totalWords: 0, // Tổng số từ trong tuần
  dailyAverage: 0, // Trung bình từ/ngày
  streak: 0 // Chuỗi ngày học liên tiếp
});

// Hàm lấy dữ liệu học theo thời gian
const fetchStatisticByTime = async (page = 0) => {
  try {
    const response = await getStudySessionByTime(token, page, pageSize.value);
    console.log('API response (By Time):', response); // Log để debug
    data.value = response.content || []; // Gán dữ liệu vào biến
    totalPages.value = response.totalPages || 0; // Cập nhật tổng số trang
    totalElements.value = response.totalElements || 0; // Cập nhật tổng số phần tử
    currentPage.value = page; // Cập nhật trang hiện tại
    calculateTodayStats(response.content || []); // Tính toán thống kê hôm nay
  } catch (error) {
    console.error("Error fetching statistics:", error); // Log lỗi
    console.warn("Unable to load study session data"); // Cảnh báo
  }
};

// Hàm lấy dữ liệu học theo từ
const fetchStatisticByWord = async (page = 0) => {
  try {
    const response = await getStudySessionByWord(token, page, pageSize.value);
    console.log('API response (By Word):', response); // Log để debug
    data.value = response.content || []; // Gán dữ liệu vào biến
    totalPages.value = response.totalPages || 0; // Cập nhật tổng số trang
    totalElements.value = response.totalElements || 0; // Cập nhật tổng số phần tử
    currentPage.value = page; // Cập nhật trang hiện tại
    calculateWordStats(response.content || []); // Tính toán thống kê từ
  } catch (error) {
    console.error("Error fetching statistics:", error); // Log lỗi
    console.warn("Unable to load word data"); // Cảnh báo
  }
};

// Hàm lấy dữ liệu chi tiết theo từ cụ thể
const fetchStatisticBySpecificWord = async (wordId, page = 0) => {
  try {
    const response = await getStudySessionBySpecificWord(token, wordId, page, pageSize.value);
    data.value = response.content || []; // Gán dữ liệu vào biến
    totalPages.value = response.totalPages || 0; // Cập nhật tổng số trang
    totalElements.value = response.totalElements || 0; // Cập nhật tổng số phần tử
    currentPage.value = page; // Cập nhật trang hiện tại
  } catch (error) {
    console.error("Error fetching statistics:", error); // Log lỗi
    console.warn("Unable to load detailed word data"); // Cảnh báo
  }
};

// Hàm lấy dữ liệu chi tiết theo thời gian cụ thể
const fetchStatisticBySpecificTime = async (time, page = 0) => {
  try {
    const response = await getStudySessionBySpecificTime(token, time, page, pageSize.value);
    const cleanedResponse = response.content?.map(item => ({
      ...item,
      time: item.time.split('.')[0] // Xử lý dữ liệu thời gian
    })) || [];
    data.value = cleanedResponse; // Gán dữ liệu vào biến
    totalPages.value = response.totalPages || 0; // Cập nhật tổng số trang
    totalElements.value = response.totalElements || 0; // Cập nhật tổng số phần tử
    currentPage.value = page; // Cập nhật trang hiện tại
  } catch (error) {
    console.error("Error fetching statistics:", error); // Log lỗi
    console.warn("Unable to load detailed session data"); // Cảnh báo
  }
};

// Hàm tính toán thống kê hôm nay
const calculateTodayStats = (timeData) => {
  const today = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay
  const todayData = timeData.find(item => item.date === today); // Tìm dữ liệu hôm nay

  if (todayData) {
    todayStats.value.wordsStudied = todayData.numberOfWords || 0; // Số từ đã học
    todayStats.value.totalReviews = todayData.numberOfWords || 0; // Tổng số lần ôn tập
  } else {
    todayStats.value.wordsStudied = 0; // Không có dữ liệu
    todayStats.value.totalReviews = 0; // Không có dữ liệu
  }

  // Tính toán chuỗi ngày học liên tiếp
  const sortedDates = timeData.sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let currentDate = new Date();

  for (let item of sortedDates) {
    const itemDate = new Date(item.date);
    const daysDiff = Math.floor((currentDate - itemDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      streak++;
      currentDate = itemDate;
    } else {
      break;
    }
  }

  weeklyStats.value.streak = streak; // Cập nhật chuỗi ngày học
  weeklyStats.value.totalWords = timeData.reduce((sum, item) => sum + (item.numberOfWords || 0), 0); // Tổng số từ
  weeklyStats.value.dailyAverage = Math.round(weeklyStats.value.totalWords / Math.max(timeData.length, 1)); // Trung bình từ/ngày
};

// Hàm tính toán thống kê từ
const calculateWordStats = (wordData) => {
  if (wordData.length > 0) {
    const totalCount = wordData.reduce((sum, item) => sum + (item.count || 0), 0); // Tổng số lần ôn tập
    todayStats.value.averageDifficulty = Math.round((totalCount / wordData.length) * 10) / 10; // Độ khó trung bình
    todayStats.value.totalReviews = totalCount; // Tổng số lần ôn tập
  } else {
    todayStats.value.averageDifficulty = 0; // Không có dữ liệu
    todayStats.value.totalReviews = 0; // Không có dữ liệu
  }
};

// Các thuộc tính tính toán cho phân trang và biểu đồ
const paginationInfo = computed(() => {
  if (totalElements.value === 0) return '0 of 0'; // Không có dữ liệu
  const start = currentPage.value * pageSize.value + 1; // Phần tử bắt đầu
  const end = Math.min((currentPage.value + 1) * pageSize.value, totalElements.value); // Phần tử kết thúc
  return `${start}-${end} of ${totalElements.value}`; // Thông tin phân trang
});

const chartData = computed(() => {
  if (!data.value || data.value.length === 0) return []; // Không có dữ liệu

  if (activeTab.value === 'By Time' && !singleItemMode.value) {
    return data.value.slice(0, 7).map((item, index) => ({
      x: index,
      y: item.numberOfWords || 0,
      label: formatDate(item.date),
      value: item.numberOfWords || 0
    }));
  } else if (activeTab.value === 'By Word' && !singleItemMode.value) {
    return data.value.slice(0, 10).map((item, index) => ({
      x: index,
      y: item.count || 0,
      label: item.word?.length > 8 ? item.word.substring(0, 8) + '...' : item.word || '',
      value: item.count || 0
    }));
  }
  return [];
});

const maxValue = computed(() => {
  if (chartData.value.length === 0) return 10; // Giá trị tối đa mặc định
  const max = Math.max(...chartData.value.map(item => item.value)); // Giá trị lớn nhất
  return isNaN(max) || max <= 0 ? 10 : max + 5; // Giá trị tối đa cho biểu đồ
});

// Các hàm trợ giúp
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : `${date.getDate()}/${date.getMonth() + 1}`; // Định dạng ngày
};

const getDifficultyLevel = (count) => {
  if (count <= 2) return 'Low'; // Độ khó thấp
  if (count <= 5) return 'Moderate'; // Độ khó trung bình
  if (count <= 8) return 'High'; // Độ khó cao
  return 'Proficient'; // Thành thạo
};

const getDifficultyColor = (count) => {
  if (count <= 2) return '#FF7675'; // Màu độ khó thấp
  if (count <= 5) return '#FDCB6E'; // Màu độ khó trung bình
  if (count <= 8) return '#6C5CE7'; // Màu độ khó cao
  return '#00B894'; // Màu thành thạo
};

const getNextReviewDate = (count) => {
  const intervals = [1, 3, 7, 14, 30, 90]; // Các khoảng thời gian ôn tập (ngày)
  const intervalIndex = Math.min(count - 1, intervals.length - 1); // Chỉ số khoảng thời gian
  const days = intervals[intervalIndex] || 90; // Số ngày ôn tập tiếp theo

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days); // Tính ngày ôn tập tiếp theo

  return nextDate.toLocaleDateString('en-GB'); // Định dạng ngày
};

// Các phương thức phân trang
const goToNextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    loadPage(currentPage.value + 1); // Chuyển sang trang tiếp theo
  }
};

const goToPreviousPage = () => {
  if (currentPage.value > 0) {
    loadPage(currentPage.value - 1); // Quay lại trang trước
  }
};

const loadPage = (page) => {
  if (singleItemMode.value) {
    if (activeTab.value === 'By Time') {
      fetchStatisticBySpecificTime(singleItemHeader.value, page); // Tải dữ liệu chi tiết theo thời gian
    } else {
      const wordId = data.value.length > 0 ? data.value[0].wordId : null;
      if (wordId) {
        fetchStatisticBySpecificWord(wordId, page); // Tải dữ liệu chi tiết theo từ
      }
    }
  } else {
    if (activeTab.value === 'By Time') {
      fetchStatisticByTime(page); // Tải dữ liệu theo thời gian
    } else {
      fetchStatisticByWord(page); // Tải dữ liệu theo từ
    }
  }
};

// Tải dữ liệu ban đầu khi component được mount
onMounted(() => {
  console.log('Component mounted, fetching initial data'); // Log để debug
  if (!token) {
    window.location.href = '/login'; // Chuyển hướng nếu không có token
    console.warn('Please log in to use this feature'); // Cảnh báo
    return;
  }
  fetchStatisticByTime(); // Tải dữ liệu ban đầu
});

// Chuyển đổi tab
const switchTab = () => {
  singleItemMode.value = false; // Thoát chế độ xem chi tiết
  if (activeTab.value === "By Word") {
    activeTab.value = "By Time"; // Chuyển sang tab "By Time"
    fetchStatisticByTime(); // Tải dữ liệu theo thời gian
  } else {
    activeTab.value = "By Word"; // Chuyển sang tab "By Word"
    fetchStatisticByWord(); // Tải dữ liệu theo từ
  }
};

// Xử lý khi chọn một phần tử để xem chi tiết
const handleSelectAnItem = (item) => {
  singleItemMode.value = true; // Bật chế độ xem chi tiết
  if (activeTab.value === 'By Time') {
    singleItemHeader.value = item.date; // Cập nhật tiêu đề
    fetchStatisticBySpecificTime(item.date); // Tải dữ liệu chi tiết theo thời gian
  } else {
    singleItemHeader.value = item.word; // Cập nhật tiêu đề
    fetchStatisticBySpecificWord(item.wordId); // Tải dữ liệu chi tiết theo từ
  }
};

// Thoát chế độ xem chi tiết
const gettingOutOfSingleItemMode = () => {
  console.log('Exiting single item mode, activeTab:', activeTab.value); // Log để debug
  singleItemMode.value = false; // Tắt chế độ xem chi tiết
  if (activeTab.value === 'By Time') {
    fetchStatisticByTime(); // Tải dữ liệu theo thời gian
  } else {
    fetchStatisticByWord(); // Tải dữ liệu theo từ
  }
};
</script>

<template>
  <Header></Header>
  <div class="container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h1 @click.stop="gettingOutOfSingleItemMode" class="main-title">
          <span class="icon">📚</span>
          Study History
        </h1>
        <p class="subtitle">Track your vocabulary learning progress with spaced repetition</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards" v-if="!singleItemMode">
      <div class="stat-card">
        <div class="stat-icon">📖</div>
        <div class="stat-content">
          <h3>Words Studied Today</h3>
          <p class="stat-number">{{ todayStats.wordsStudied }}</p>
          <span class="stat-subtitle">words</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <h3>Study Streak</h3>
          <p class="stat-number">{{ weeklyStats.streak }}</p>
          <span class="stat-subtitle">consecutive days</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Total Reviews</h3>
          <p class="stat-number">{{ todayStats.totalReviews }}</p>
          <span class="stat-subtitle">reviews</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <h3>Daily Average</h3>
          <p class="stat-number">{{ weeklyStats.dailyAverage }}</p>
          <span class="stat-subtitle">words/day</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button v-if="!singleItemMode"
                :class="{ active: activeTab === 'By Time' }"
                @click="switchTab"
                class="tab-button">
          <span class="tab-icon">📅</span>
          By Date
        </button>
        <button v-if="!singleItemMode"
                :class="{ active: activeTab === 'By Word' }"
                @click="switchTab"
                class="tab-button">
          <span class="tab-icon">📝</span>
          By Word
        </button>
        <div v-if="singleItemMode" class="single-item-header">
          <button @click="gettingOutOfSingleItemMode" class="back-btn">
            ← Back
          </button>
          <h2>{{ singleItemHeader }}</h2>
        </div>
      </div>
    </div>

    <!-- Chart Visualization -->
    <div class="chart-container" v-if="!singleItemMode && chartData.length > 0">
      <div class="chart-header">
        <h3>{{ activeTab === 'By Time' ? 'Progress by Date' : 'Word Proficiency' }}</h3>
        <div class="chart-legend">
          <span class="legend-item">
            <div class="legend-color primary"></div>
            {{ activeTab === 'By Time' ? 'Words Studied' : 'Review Count' }}
          </span>
        </div>
      </div>
      <div class="chart">
        <svg width="100%" height="220" viewBox="0 0 800 220">
          <!-- Grid lines -->
          <defs>
            <pattern id="grid" width="40" height="22" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 22" fill="none" stroke="#f5f5f5" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <!-- Y-axis labels -->
          <g v-for="i in 5" :key="i">
            <text
                x="10"
                :y="200 - (i * 40)"
                class="axis-label"
                text-anchor="start"
            >
              {{ Math.round((maxValue / 5) * i) }}
            </text>
            <line
                x1="30"
                :y1="200 - (i * 40)"
                x2="780"
                :y2="200 - (i * 40)"
                stroke="#e0e0e0"
                stroke-width="1"
                stroke-dasharray="5,5"
            />
          </g>

          <!-- Bars -->
          <g v-for="(point, index) in chartData" :key="index">
            <rect
                :x="50 + index * ((800 - 100) / chartData.length)"
                :y="200 - (point.value / maxValue * 160)"
                :width="((800 - 100) / chartData.length) - 20"
                :height="point.value / maxValue * 160"
                :fill="`url(#gradient-${index % 3})`"
                class="chart-bar"
                rx="4"
            >
              <title>{{ point.label }}: {{ point.value }} {{ activeTab === 'By Time' ? 'words' : 'reviews' }}</title>
            </rect>
            <text
                :x="50 + index * ((800 - 100) / chartData.length) + (((800 - 100) / chartData.length) / 2) - 10"
                y="215"
                text-anchor="middle"
                class="chart-label"
            >
              {{ point.label }}
            </text>
          </g>

          <!-- Gradients -->
          <defs>
            <linearGradient id="gradient-0" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#6C5CE7;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#A29BFE;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#00B894;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#55EFC4;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#FF7675;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FFB3BA;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>

    <!-- Data List -->
    <div class="data-section">
      <!-- By Time - List Mode -->
      <div v-if="activeTab === 'By Time' && !singleItemMode" class="data-grid">
        <p v-if="!data.length" class="no-data">No study session data</p>
        <div v-for="d in data" :key="d.date" class="data-card time-card" @click.stop="handleSelectAnItem(d)">
          <div class="card-header">
            <div class="date-badge">{{ formatDate(d.date) }}</div>
            <div class="progress-ring">
              <svg width="50" height="50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#e0e0e0" stroke-width="4"/>
                <circle cx="25" cy="25" r="20" fill="none" stroke="#6C5CE7" stroke-width="4"
                        :stroke-dasharray="`${Math.min((d.numberOfWords / 20) * 125.6, 125.6)} 125.6`"
                        transform="rotate(-90 25 25)"/>
              </svg>
              <span class="progress-text">{{ d.numberOfWords }}</span>
            </div>
          </div>
          <div class="card-content">
            <p class="word-count">{{ d.numberOfWords }} words studied</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{width: Math.min(d.numberOfWords * 5, 100) + '%'}"></div>
            </div>
            <p class="date-full">{{ d.date }}</p>
          </div>
        </div>
      </div>

      <!-- By Word - List Mode -->
      <div v-if="activeTab === 'By Word' && !singleItemMode" class="data-grid">
        <p v-if="!data.length" class="no-data">No word data</p>
        <div v-for="d in data" :key="d.wordId" class="data-card word-card" @click.stop="handleSelectAnItem(d)">
          <div class="card-header">
            <div class="word-badge">{{ d.word }}</div>
            <div class="difficulty-badge" :style="{backgroundColor: getDifficultyColor(d.count)}">
              {{ getDifficultyLevel(d.count) }}
            </div>
          </div>
          <div class="card-content">
            <p class="practice-count">{{ d.count }} reviews</p>
            <div class="difficulty-indicator">
              <div class="difficulty-dots">
                <div v-for="i in 10" :key="i" :class="['dot', { active: i <= Math.min(d.count, 10) }]"></div>
              </div>
            </div>
            <p class="next-review">Next review: {{ getNextReviewDate(d.count) }}</p>
          </div>
          <div class="hidden">{{ d.wordId }}</div>
        </div>
      </div>

      <!-- Single Item Mode - Sessions -->
      <div v-if="singleItemMode" class="sessions-container">
        <div class="sessions-header">
          <h3>Study History Details</h3>
          <div class="sessions-count">{{ data.length }} sessions</div>
        </div>

        <div class="sessions-timeline">
          <div v-if="activeTab === 'By Word'" v-for="(d, index) in data" :key="d.wordId + index" class="session-item">
            <div class="session-timeline-dot"></div>
            <div class="session-card">
              <div class="session-header">
                <span class="session-word">{{ d.word }}</span>
                <span class="session-date">{{ d.date }}</span>
              </div>
              <div class="session-details">
                <div class="detail-row">
                  <span class="detail-label">Selected Difficulty:</span>
                  <span class="difficulty-choice" :style="{color: getDifficultyColor(parseInt(d.choosenAnswer))}">
                    {{ d.choosenAnswer }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'By Time'" v-for="(d, index) in data" :key="d.time + index" class="session-item">
            <div class="session-timeline-dot"></div>
            <div class="session-card">
              <div class="session-header">
                <span class="session-time">{{ d.time }}</span>
                <span class="session-word">{{ d.word }}</span>
              </div>
              <div class="session-details">
                <div class="detail-row">
                  <span class="detail-label">Selected Difficulty:</span>
                  <span class="difficulty-choice" :style="{color: getDifficultyColor(parseInt(d.choosenAnswer))}">
                    {{ d.choosenAnswer }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <div class="pagination">
        <button @click="goToPreviousPage" :disabled="currentPage === 0" class="pagination-btn prev">
          <span>←</span> Previous
        </button>

        <div class="pagination-info">
          <span class="page-info">{{ paginationInfo }}</span>
          <span class="page-number">
            {{ totalPages > 0 ? `Page ${currentPage + 1} / ${totalPages}` : 'No data' }}
          </span>
        </div>

        <button @click="goToNextPage" :disabled="currentPage >= totalPages - 1" class="pagination-btn next">
          Next <span>→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 80px;
  margin-left: 100px;
  margin-right: 100px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden; /* Prevent overflow issues */
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  border-radius: 15px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px; /* Ensure content is visible */
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.main-title:hover {
  transform: scale(1.05);
}

.icon {
  font-size: 2rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 15px 0 0 0;
  line-height: 1.4;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
}

.stat-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-content h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.stat-number {
  margin: 5px 0 2px 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.stat-subtitle {
  font-size: 0.8rem;
  color: #999;
  margin: 0;
}

/* Tabs */
.tabs-container {
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  gap: 10px;
  background: white;
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.tab-button {
  flex: 1;
  padding: 15px 25px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #666;
  background: transparent;
}

.tab-button.active {
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  color: white;
  box-shadow: 0 5px 15px rgba(108, 92, 231, 0.3);
}

.tab-button:hover:not(.active) {
  background: #f8f9ff;
  color: #6C5CE7;
}

.tab-icon {
  font-size: 1.2rem;
}

/* Single Item Header */
.single-item-header {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.back-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #FF7675, #FFB3BA);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.back-btn:hover {
  transform: scale(1.05);
}

.single-item-header h2 {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

/* Chart */
.chart-container {
  background: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.chart-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-color.primary {
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
}

.chart {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

.chart-bar {
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.8;
}

.chart-label, .axis-label {
  font-size: 0.8rem;
  fill: #666;
  font-weight: 500;
}

/* Data Grid */
.data-section {
  margin-bottom: 30px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.data-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.data-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
}

.data-card:hover::before {
  transform: scaleX(1);
}

/* Time Card */
.time-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-badge {
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.progress-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  position: absolute;
  font-weight: 700;
  font-size: 0.9rem;
  color: #6C5CE7;
}

.card-content {
  text-align: left;
}

.word-count {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.date-full {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

/* Word Card */
.word-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.word-badge {
  background: linear-gradient(135deg, #00B894, #55EFC4);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.difficulty-badge {
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.8rem;
}

.practice-count {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.difficulty-indicator {
  margin-bottom: 15px;
}

.difficulty-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

.dot.active {
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  transform: scale(1.2);
}

.next-review {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.hidden {
  display: none;
}

/* Sessions */
.sessions-container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.sessions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f5f5f5;
}

.sessions-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.4rem;
}

.sessions-count {
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.sessions-timeline {
  position: relative;
}

.sessions-timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #6C5CE7, #A29BFE);
}

.session-item {
  position: relative;
  margin-bottom: 25px;
  padding-left: 60px;
}

.session-timeline-dot {
  position: absolute;
  left: 14px;
  top: 15px;
  width: 12px;
  height: 12px;
  background: white;
  border: 3px solid #6C5CE7;
  border-radius: 50%;
  z-index: 2;
}

.session-card {
  background: #f8f9ff;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #6C5CE7;
  transition: all 0.3s ease;
}

.session-card:hover {
  background: #f0f2ff;
  transform: translateX(5px);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
  flex-wrap: wrap;
}

.session-word {
  font-weight: 700;
  font-size: 1.1rem;
  color: #333;
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  border: 2px solid #6C5CE7;
}

.session-time {
  font-weight: 600;
  font-size: 1rem;
  color: #6C5CE7;
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #6C5CE7;
}

.session-date {
  font-size: 0.9rem;
  color: #666;
  background: white;
  padding: 4px 10px;
  border-radius: 6px;
}

.session-details {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.detail-label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.difficulty-choice {
  font-weight: 700;
  font-size: 0.9rem;
  padding: 4px 10px;
  background: rgba(108, 92, 231, 0.1);
  border-radius: 6px;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 30px;
  background: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.pagination-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn:not(:disabled) {
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  color: white;
}

.pagination-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #5B4BD5, #9188FC);
  transform: scale(1.05);
}

.pagination-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.page-number {
  font-size: 0.8rem;
  color: #999;
}

/* No Data Message */
.no-data {
  text-align: center;
  color: #666;
  font-size: 1rem;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 10px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .container {
    margin-left: 50px;
    margin-right: 50px;
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .container {
    margin-left: 20px;
    margin-right: 20px;
    padding: 20px;
    margin-top: 60px;
  }

  .main-title {
    font-size: 2rem;
  }

  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .stat-card {
    padding: 20px;
  }

  .data-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .tabs {
    flex-direction: column;
    gap: 5px;
  }

  .chart-container {
    padding: 20px;
  }

  .sessions-container {
    padding: 20px;
  }

  .session-item {
    padding-left: 50px;
  }

  .pagination {
    flex-direction: column;
    gap: 15px;
    padding: 20px;
  }

  .session-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>