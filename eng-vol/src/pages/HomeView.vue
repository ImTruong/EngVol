<script setup>
import { ref, onMounted, computed } from "vue";
import Header from "@/components/Header.vue";
import SetBox from "@/components/SetBox.vue";
import { useRouter } from "vue-router";
import { getCurrentUser } from "@/apis/userApi";
import { getRecentSet, getAllPublicSet, getLibrarySet } from "@/apis/setApi";

const router = useRouter();
const sets = ref([]);
const recentSetsData = ref({
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
});
const publicSetsData = ref({
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
});
const librarySetsPage = ref(0);
const recentSetsPage = ref(0);
const publicSetsPage = ref(0);
const recentSetsSize = ref(6);
const publicSetsSize = ref(6);
const librarySetsSize = ref(6);
const isLoadingRecent = ref(false);
const isLoadingPublic = ref(false);
const isGuestMode = ref(false);

// Kiểm tra token và đặt chế độ khách nếu cần
const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    isGuestMode.value = true;
    console.log("Guest mode activated: No token found");
  }
  return token;
};

const fetchUserInfo = async (token) => {
  try {
    const user = await getCurrentUser(token);
    localStorage.setItem("user", JSON.stringify(user));
    isGuestMode.value = false;
  } catch (error) {
    console.error("Error fetching user info:", error);
    isGuestMode.value = true;
    console.log("Guest mode activated: User API error");
  }
};

const fetchRecentSet = async (token, page) => {
  if (isGuestMode.value) return;

  try {
    isLoadingRecent.value = true;
    const response = await getRecentSet(token, page, recentSetsSize.value);
    recentSetsData.value = response;
    recentSetsPage.value = page;
  } catch (error) {
    console.error("Error fetching recent sets:", error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      isGuestMode.value = true;
      console.log("Guest mode activated: Recent sets API unauthorized");
    }
  } finally {
    isLoadingRecent.value = false;
  }
};

const fetchPublicSet = async (token, page) => {
  try {
    isLoadingPublic.value = true;
    const response = await getAllPublicSet(page, publicSetsSize.value);
    publicSetsData.value = response;
    publicSetsPage.value = page;
  } catch (error) {
    console.error("Error fetching public sets:", error);
    alert("Failed to load public sets. Please try again.");
  } finally {
    isLoadingPublic.value = false;
  }
};

const fetchLibrarySet = async (token) => {
  if (isGuestMode.value) return;

  try {
    const response = await getLibrarySet(token, librarySetsPage.value, librarySetsSize.value);
    sets.value = response.content;
  } catch (error) {
    console.error("Error fetching library sets:", error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      isGuestMode.value = true;
      console.log("Guest mode activated: Library API unauthorized");
    }
  }
};

const fetchAllData = async () => {
  const token = checkAuthStatus();
  if (!token) {
    await fetchPublicSet(null, publicSetsPage.value);
    return;
  }

  try {
    await Promise.all([
      fetchUserInfo(token),
      fetchPublicSet(token, publicSetsPage.value)
    ]);

    if (!isGuestMode.value) {
      await Promise.all([
        fetchLibrarySet(token),
        fetchRecentSet(token, recentSetsPage.value)
      ]);
    }
  } catch (error) {
    console.error("Error in fetchAllData:", error);
    isGuestMode.value = true;
    console.log("Guest mode activated: General error in data fetching");
    await fetchPublicSet(null, publicSetsPage.value);
  }
};

const guestMessage = computed(() => {
  return isGuestMode.value ? "You are browsing as a guest. Sign in to access all features." : "";
});

onMounted(() => {
  fetchAllData();
});

const goToStudy = () => {
  if (isGuestMode.value) {
    router.push("/login");
    return;
  }
  router.push("/review");
};

const goToLibrary = () => {
  if (isGuestMode.value) {
    router.push("/login");
    return;
  }
  localStorage.setItem("libraryTab", "FlashSetBox sets");
  router.push("/library");
};

const changePage = async (type, page) => {
  if (page < 0 || page >= (type === "recent" ? recentSetsData.value.totalPages : publicSetsData.value.totalPages)) return;

  const token = localStorage.getItem("token");
  if (type === "recent" && !isGuestMode.value) {
    await fetchRecentSet(token, page);
  } else if (type === "public") {
    await fetchPublicSet(token, page);
  }
};

const getPageNumbers = (totalPages, currentPage) => {
  const maxPagesToShow = 5;
  const pages = [];
  let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(0, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
};
</script>

<template>
  <Header
      :recentSets="isGuestMode ? [] : recentSetsData.content"
      :ownerSets="isGuestMode ? [] : sets"
      :publicSets="publicSetsData.content"
      :isGuestMode="isGuestMode"
      @reload="fetchAllData"
  />

  <div class="home-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to FlashCard Hub</h1>
        <p class="hero-subtitle">Master your learning with smart flashcards</p>

        <!-- Guest mode message -->
        <div v-if="isGuestMode" class="guest-welcome-card">
          <div class="guest-icon">👋</div>
          <h3>Welcome, Guest!</h3>
          <p>{{ guestMessage }}</p>
          <div class="guest-actions">
            <button @click="router.push('/login')" class="btn-primary">
              <span class="btn-icon">🔐</span>
              Login
            </button>
            <button @click="router.push('/signup')" class="btn-secondary">
              <span class="btn-icon">✨</span>
              Join Us
            </button>
          </div>
        </div>

        <!-- Review box for logged-in users -->
        <div v-else class="review-card" @click="goToStudy">
          <div class="review-icon">📚</div>
          <div class="review-content">
            <h3>Ready to Study?</h3>
            <p>Continue your learning journey</p>
          </div>
          <div class="review-arrow">→</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Recent Section -->
      <section v-if="!isGuestMode" class="content-section recent-section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-icon">⏰</span>
            <h2>Recently Viewed</h2>
          </div>
        </div>

        <div class="cards-grid recent-grid">
          <SetBox
              v-for="set in recentSetsData.content"
              :key="set.id"
              :set="set"
              @reload="fetchAllData"
              class="recent-card"
          />
        </div>

        <!-- Recent Pagination -->
        <div v-if="recentSetsData.totalPages > 0" class="pagination-wrapper">
          <div class="pagination-info">
            Showing {{ recentSetsData.content.length }} of {{ recentSetsData.totalElements }} recent sets
          </div>
          <div class="pagination-controls">
            <button
                @click="changePage('recent', recentSetsPage - 1)"
                :disabled="recentSetsPage === 0 || isLoadingRecent"
                class="pagination-btn nav-btn"
            >
              ‹ Previous
            </button>

            <div class="page-numbers">
              <button
                  v-for="page in getPageNumbers(recentSetsData.totalPages, recentSetsPage)"
                  :key="page"
                  @click="changePage('recent', page)"
                  :class="['pagination-btn', 'page-btn', { active: page === recentSetsPage }]"
                  :disabled="isLoadingRecent"
              >
                {{ page + 1 }}
              </button>
            </div>

            <button
                @click="changePage('recent', recentSetsPage + 1)"
                :disabled="recentSetsPage + 1 >= recentSetsData.totalPages || isLoadingRecent"
                class="pagination-btn nav-btn"
            >
              Next ›
            </button>
          </div>
          <div v-if="isLoadingRecent" class="loading-indicator">Loading...</div>
        </div>
      </section>

      <!-- Library Section -->
      <section v-if="!isGuestMode" class="content-section library-section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-icon">📖</span>
            <h2 @click="goToLibrary" class="clickable-title">Your Library</h2>
          </div>
          <button v-if="sets.length > 3" @click="goToLibrary" class="view-all-btn">
            View All <span class="arrow">→</span>
          </button>
        </div>

        <div class="cards-grid library-grid">
          <SetBox
              v-for="set in sets.slice(0, 6)"
              :key="set.id"
              :set="set"
              @reload="fetchAllData"
              class="library-card"
          />
        </div>
      </section>

      <!-- Community Section -->
      <section class="content-section community-section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-icon">🌍</span>
            <h2>Community Hub</h2>
          </div>
          <div class="community-stats">
            <span class="stat">{{ publicSetsData.totalElements }} public sets</span>
          </div>
        </div>

        <div class="cards-grid community-grid">
          <SetBox
              v-for="set in publicSetsData.content"
              :key="set.id"
              :set="set"
              @reload="fetchAllData"
              :isGuestMode="isGuestMode"
              class="community-card"
          />
        </div>

        <!-- Public Sets Pagination -->
        <div v-if="publicSetsData.totalPages > 0" class="pagination-wrapper">
          <div class="pagination-info">
            Page {{ publicSetsData.number + 1 }} of {{ publicSetsData.totalPages }}
          </div>
          <div class="pagination-controls">
            <button
                @click="changePage('public', publicSetsPage - 1)"
                :disabled="publicSetsPage === 0 || isLoadingPublic"
                class="pagination-btn nav-btn"
            >
              ‹ Previous
            </button>

            <div class="page-numbers">
              <button
                  v-for="page in getPageNumbers(publicSetsData.totalPages, publicSetsPage)"
                  :key="page"
                  @click="changePage('public', page)"
                  :class="['pagination-btn', 'page-btn', { active: page === publicSetsPage }]"
                  :disabled="isLoadingPublic"
              >
                {{ page + 1 }}
              </button>
            </div>

            <button
                @click="changePage('public', publicSetsPage + 1)"
                :disabled="publicSetsPage + 1 >= publicSetsData.totalPages || isLoadingPublic"
                class="pagination-btn nav-btn"
            >
              Next ›
            </button>
          </div>
          <div v-if="isLoadingPublic" class="loading-indicator">Loading...</div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Base styles */
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Hero Section */
.hero-section {
  padding: 60px 50px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

/* Guest Welcome Card */
.guest-welcome-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  color: #333;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  animation: slideUp 0.6s ease-out;
}

.guest-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.guest-welcome-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.guest-welcome-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.guest-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Review Card */
.review-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  color: #333;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  animation: slideUp 0.6s ease-out;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.review-icon {
  font-size: 2.5rem;
}

.review-content h3 {
  font-size: 1.3rem;
  margin-bottom: 0.3rem;
  color: #333;
}

.review-content p {
  color: #666;
  margin: 0;
}

.review-arrow {
  font-size: 1.5rem;
  color: #667eea;
  margin-left: auto;
}

/* Main Content */
.main-content {
  padding: 0 50px 50px;
}

/* Content Sections */
.content-section {
  margin-bottom: 4rem;
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
}

.recent-section {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border-left: 4px solid #667eea;
}

.library-section {
  background: linear-gradient(135deg, #fff 0%, #f8fff8 100%);
  border-left: 4px solid #4ecdc4;
}

.community-section {
  background: linear-gradient(135deg, #fff 0%, #fff8f0 100%);
  border-left: 4px solid #ff6b6b;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0,0,0,0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.section-icon {
  font-size: 1.8rem;
}

.section-title h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.clickable-title {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable-title:hover {
  color: #667eea;
  transform: translateX(5px);
}

.view-all-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.community-stats {
  color: #666;
  font-size: 0.9rem;
}

/* Card Grids */
.cards-grid {
  display: grid;
  gap: 1.5rem;
}

.recent-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.library-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.community-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

/* Button Styles */
.btn-primary, .btn-secondary {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Pagination */
.pagination-wrapper {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.pagination-info {
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-btn {
  padding: 0.5rem 0.8rem;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #f0f5ff;
  color: #667eea;
  border-color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.nav-btn {
  font-weight: 500;
}

.page-btn {
  min-width: 35px;
}

.loading-indicator {
  text-align: center;
  color: #667eea;
  margin-top: 1rem;
  font-weight: 500;
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .home-container {
    padding: 0;
  }

  .hero-section {
    padding: 40px 20px 30px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 0 20px 30px;
  }

  .content-section {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .guest-actions {
    flex-direction: column;
    align-items: center;
  }

  .review-card {
    flex-direction: column;
    text-align: center;
  }

  .pagination-controls {
    flex-wrap: wrap;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .section-title h2 {
    font-size: 1.4rem;
  }
}
</style>