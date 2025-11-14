<template>
  <div class="event-list">
    <h2>이벤트 목록</h2>
    <button @click="goToEventAdd()" style="cursor: pointer">이벤트 등록</button>

    <!-- 검색 조건 -->
    <div class="search-form">
      <select v-model="filters.recruit_status">
        <option value="">모집상태 선택</option>
        <option value="DC1">모집예정</option>
        <option value="DC2">모집중</option>
        <option value="DC3">모집마감</option>
        <option value="DC4">진행중</option>
        <option value="DC5">종료</option>
      </select>

      <input
        type="date"
        v-model="filters.recruit_start_date"
        placeholder="모집 시작일"
      />
      <input
        type="date"
        v-model="filters.recruit_end_date"
        placeholder="모집 종료일"
      />

      <input
        type="date"
        v-model="filters.event_start_date"
        placeholder="시행 시작일"
      />
      <input
        type="date"
        v-model="filters.event_end_date"
        placeholder="시행 종료일"
      />

      <input type="text" v-model="filters.event_name" placeholder="이벤트명" />

      <button @click="fetchEvents">검색</button>
      <button @click="resetFilters">초기화</button>
    </div>

    <div class="cards">
      <div
        class="card"
        v-for="event in events"
        :key="event.event_code"
        @click="goToEventInfo(event.event_code)"
        style="cursor: pointer"
      >
        <div class="card-image">
          <img
            v-if="event.file_path"
            :src="event.file_path"
            alt="이벤트 이미지"
          />
          <div v-else class="no-image">이미지 없음</div>
        </div>
        <div class="card-content">
          <h3>{{ event.event_name }}</h3>
          <p>
            시행기간: {{ formatDate(event.event_start_date) }} ~
            {{ formatDate(event.event_end_date) }}
          </p>
          <p>
            모집기간: {{ formatDate(event.recruit_start_date) }} ~
            {{ formatDate(event.recruit_end_date) }}
          </p>
          <p>
            신청인원/모집인원: {{ event.total_sub_recruit_count }} /
            {{ event.max_participants }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import dateFormat from "@/utils/dateFormat";
import { useRouter } from "vue-router";

const router = useRouter();

const goToEventAdd = () => {
  router.push({ name: "EventAdd" });
};

const goToEventInfo = (event_code) => {
  router.push({ name: "EventInfo", query: { code: event_code } });
};

const events = ref([]);

// 검색 조건
const filters = ref({
  recruit_status: "",
  recruit_start_date: "",
  recruit_end_date: "",
  event_start_date: "",
  event_end_date: "",
  event_name: "",
});

const fetchEvents = async () => {
  try {
    // 쿼리스트링으로 전달
    const query = new URLSearchParams(filters.value).toString();
    const res = await axios.get(`/api/event/list?${query}`); // 백엔드에서 위 쿼리 결과 반환
    events.value = res.data.data;
  } catch (err) {
    console.error("이벤트 메인 조회 실패", err);
  }
};

const resetFilters = () => {
  filters.value = {
    recruit_status: "",
    recruit_start_date: "",
    recruit_end_date: "",
    event_start_date: "",
    event_end_date: "",
    event_name: "",
  };
  fetchEvents();
};

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateFormat(dateStr, "yyyy-MM-dd");
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.event-list {
  max-width: 1200px;
  margin: 20px auto;
}
.search-form {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  flex-wrap: wrap;
  align-items: center;
}
.search-form input,
.search-form select {
  padding: 4px 8px;
  font-size: 14px;
}
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.card {
  width: 280px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.card-image {
  width: 100%;
  height: 180px;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.card-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}
.no-image {
  color: #888;
  font-size: 14px;
}
.card-content {
  padding: 12px;
}
.card-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
}
.card-content p {
  margin: 4px 0;
  font-size: 14px;
}
</style>
