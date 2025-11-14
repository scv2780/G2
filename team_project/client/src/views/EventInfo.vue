<template>
  <div class="event-info">
    <!-- 대표 이미지 -->
    <div class="event-image">
      <img
        v-if="mainImage"
        :src="mainImage"
        alt="이벤트 이미지"
        class="main-img"
      />
      <div v-else class="no-image">이미지 없음</div>
    </div>

    <!-- 기본 정보 -->
    <div class="card">
      <h3>기본 정보</h3>
      <div class="info-grid">
        <div><strong>이벤트명:</strong> {{ event.event_name }}</div>
        <div><strong>기관명:</strong> {{ event.org_name }}</div>
        <div><strong>매니저:</strong> {{ event.main_manager_name }}</div>
        <div><strong>모집상태:</strong> {{ event.recruit_status_name }}</div>
        <div><strong>최대 참여자:</strong> {{ event.max_participants }}</div>
        <div><strong>장소:</strong> {{ event.event_location }}</div>
      </div>
    </div>

    <!-- 기간 정보 -->
    <div class="card">
      <h3>기간</h3>
      <div class="info-grid">
        <div>
          <strong>모집:</strong>
          {{ formatDate(event.recruit_start_date) }} ~
          {{ formatDate(event.recruit_end_date) }}
        </div>
        <div>
          <strong>진행:</strong>
          {{ formatDate(event.event_start_date) }} ~
          {{ formatDate(event.event_end_date) }}
        </div>
      </div>
    </div>

    <!-- 내용 -->
    <div class="card">
      <h3>내용</h3>
      <p>{{ event.event_content }}</p>
    </div>

    <!-- 예약제일 경우: 달력 표시 -->
    <div
      v-if="event.event_type_name === '예약제' && event.sub_events.length"
      class="card"
    >
      <h3>예약 가능한 일정</h3>

      <FullCalendar :options="calendarOptions" />
    </div>

    <!-- 첨부파일 -->
    <div v-if="event.attachments.length" class="card">
      <h3>첨부파일</h3>
      <ul>
        <li v-for="file in event.attachments" :key="file.server_filename">
          <a
            :href="file.file_path"
            :download="file.original_filename"
            target="_blank"
          >
            {{ file.original_filename }}
          </a>
        </li>
      </ul>
    </div>

    <!-- 신청제일 경우: 하단 신청 버튼 -->
    <div v-if="event.event_type_name === '신청제'" class="apply-button-wrap">
      <button class="apply-btn" @click="applySimple">신청하기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import dateFormat from "@/utils/dateFormat";

import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const route = useRoute();
const event = ref({
  sub_events: [],
  attachments: [],
});

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  events: [],
  eventClick: (info) => onEventClick(info),
});

const formatDate = (d) => (d ? dateFormat(d, "yyyy-MM-dd") : "");

// 대표 이미지
const mainImage = ref("");

const fetchEvent = async () => {
  const code = route.query.code;
  const res = await axios.get(`/api/event/${code}`);
  event.value = res.data.data;

  // 대표 이미지 설정
  const img = event.value.attachments.find((x) =>
    /\.(jpg|jpeg|png|gif)$/i.test(x.original_filename)
  );
  mainImage.value = img ? img.file_path : "";

  // 캘린더 이벤트 구성
  calendarOptions.value.events = event.value.sub_events.map((s) => ({
    title: s.sub_event_name,
    start: s.sub_event_start_date,
    end: s.sub_event_end_date,
    extendedProps: {
      code: s.sub_event_code,
      max: s.sub_recruit_count,
    },
  }));
};

// 캘린더 일정 클릭 시 신청
const onEventClick = async (info) => {
  const sub_event_code = info.event.extendedProps.code;

  // 날짜 포맷 함수
  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const MM = d.getMonth() + 1;
    const dd = d.getDate();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}년 ${MM}월 ${dd}일 ${hh}:${mm}`;
  };

  const startStr = formatDateTime(info.event.start);
  const endStr = formatDateTime(info.event.end);

  const ok = confirm(
    `[일정: ${startStr} - ${endStr}, 제목: ${info.event.title}] 예약하시겠습니까?`
  );
  if (!ok) return;

  try {
    await axios.post("/api/event/apply-sub", { sub_event_code });
    alert("신청 완료!");
  } catch (err) {
    alert("신청 실패");
    console.error(err);
  }
};

// 신청제: 단순 신청하기
const applySimple = async () => {
  try {
    await axios.post("/api/event/apply", {
      event_code: event.value.event_code,
    });
    alert("신청 완료!");
  } catch (err) {
    alert("신청 실패");
  }
};

onMounted(fetchEvent);
</script>

<style scoped>
.event-info {
  max-width: 900px;
  margin: 20px auto;
  font-family: Arial;
}

.event-image {
  width: 100%;
  height: 250px;
  border-radius: 10px;
  overflow: hidden;
  background: #eee;
  margin-bottom: 20px;
}
.main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card {
  background: #fff;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
}

.apply-button-wrap {
  text-align: center;
  margin-top: 30px;
}

.apply-btn {
  background: #1976d2;
  color: white;
  border: none;
  padding: 14px 26px;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}
.apply-btn:hover {
  background: #125ea8;
}
</style>
