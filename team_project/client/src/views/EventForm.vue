<template>
  <div class="event-form">
    <h2>이벤트 {{ isUpdated ? "수정" : "등록" }}</h2>
    <form @submit.prevent="submitForm">
      <!-- 기본 정보 -->
      <div>
        <label>이벤트 타입</label>
        <select v-model="eventInfo.event_type" required>
          <option value="DD1">신청제</option>
          <option value="DD2">예약제</option>
        </select>
      </div>
      <div>
        <label>이벤트 이름</label>
        <input type="text" v-model="eventInfo.event_name" required />
      </div>
      <div>
        <label>내용</label>
        <textarea v-model="eventInfo.event_content" required></textarea>
      </div>
      <div>
        <label>기관 코드</label>
        <input type="text" v-model="eventInfo.org_code" required />
      </div>
      <div>
        <label>메인 매니저 코드</label>
        <input type="text" v-model="eventInfo.user_code" required />
      </div>
      <div>
        <label>등록일</label>
        <input type="date" v-model="formattedRegisterDate" readonly />
      </div>
      <div>
        <label>이벤트 장소</label>
        <input type="text" v-model="eventInfo.event_location" required />
      </div>
      <div>
        <label>대상</label>
        <input type="text" v-model="eventInfo.target_audience" required />
      </div>
      <div>
        <label>최대 참여자</label>
        <input type="number" v-model="eventInfo.max_participants" />
      </div>
      <div>
        <label>모집 시작일</label>
        <input type="date" v-model="eventInfo.recruit_start_date" />
      </div>
      <div>
        <label>모집 종료일</label>
        <input type="date" v-model="eventInfo.recruit_end_date" />
      </div>
      <div>
        <label>이벤트 시작일</label>
        <input type="date" v-model="eventInfo.event_start_date" />
      </div>
      <div>
        <label>이벤트 종료일</label>
        <input type="date" v-model="eventInfo.event_end_date" />
      </div>
      <!-- 예약제일 경우 세부 이벤트 -->
      <div v-if="eventInfo.event_type === 'DD2'" class="additional-times">
        <h4>세부 예약 이벤트</h4>
        <div v-for="(item, index) in eventTimes" :key="index" class="time-item">
          <label>세부 이벤트명</label>
          <input
            type="text"
            v-model="item.name"
            placeholder="세부 이벤트명 입력"
          />
          <label>최대 참여자</label>
          <input
            type="number"
            v-model="item.max_participants"
            placeholder="인원"
          />
          <label>시작일 + 시간</label>
          <input type="datetime-local" v-model="item.start" />
          <label>종료일 + 시간</label>
          <input type="datetime-local" v-model="item.end" />

          <button type="button" @click="removeTime(index)">삭제</button>
        </div>
        <button type="button" @click="addTime">추가</button>
      </div>

      <div>
        <label>모집 상태</label>
        <input type="text" v-model="eventInfo.recruit_status" readonly />
      </div>
      <div>
        <label>등록 상태</label>
        <input type="text" v-model="eventInfo.register_status" readonly />
      </div>

      <button type="submit">{{ isUpdated ? "수정" : "등록" }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import dateFormat from "@/utils/dateFormat";

const route = useRoute();
const router = useRouter();

const eventInfo = ref({
  event_code: "",
  org_code: "",
  user_code: "",
  event_type: "DD1",
  event_name: "",
  event_content: "",
  event_register_date: new Date(),
  event_location: "",
  target_audience: "",
  max_participants: 0,
  recruit_start_date: new Date(),
  recruit_end_date: new Date(),
  event_start_date: new Date(),
  event_end_date: new Date(),
  recruit_status: "DC1",
  register_status: "DE1",
});

const isUpdated = ref(false);
const formattedRegisterDate = computed(() =>
  dateFormat(eventInfo.value.event_register_date, "yyyy-MM-dd")
);

// 예약제용 시작/종료일 리스트
const eventTimes = ref([]);

// 예약제/신청제 변경 시 초기화
watch(
  () => eventInfo.value.event_type,
  (newType) => {
    if (newType === "DD2" && eventTimes.value.length === 0) {
      addTime();
    } else if (newType === "DD1") {
      eventTimes.value = [];
    }
  }
);

// 추가/삭제
const addTime = () => {
  eventTimes.value.push({
    name: "", // 세부 이벤트명
    max_participants: 0, // 세부 모집인원
    start: "",
    end: "",
  });
};

const removeTime = (index) => eventTimes.value.splice(index, 1);

// 등록/수정
const submitForm = async () => {
  try {
    // 1. 이벤트 테이블 저장
    const eventObj = {
      ...eventInfo.value,
      event_register_date: formattedRegisterDate.value,
    };

    let savedEvent;

    if (isUpdated.value) {
      savedEvent = await axios.put(
        `/api/event/${eventInfo.value.event_code}`,
        eventObj
      );
      alert("이벤트 수정 완료!");
    } else {
      savedEvent = await axios.post("/api/event", eventObj);
      alert("이벤트 등록 완료!");
    }

    const eventCode =
      savedEvent.data.data.event_code || eventInfo.value.event_code;

    // 2. 예약제일 경우 세부 이벤트 저장
    if (eventInfo.value.event_type === "DD2" && eventTimes.value.length > 0) {
      const subEventObj = {
        event_code: eventCode,
        sub_events: eventTimes.value.map((e) => ({
          sub_event_name: e.name,
          sub_recruit_count: e.max_participants,
          sub_event_start_date: e.start,
          sub_event_end_date: e.end,
        })),
      };

      await axios.post("/api/event/sub-events", subEventObj);
    }

    router.push("/event");
  } catch (err) {
    console.error(err);
    alert(isUpdated.value ? "수정 실패" : "등록 실패");
  }
};

// 단건 조회
const getEventInfo = async (eno) => {
  try {
    const result = await axios.get(`/api/event/${eno}`);
    eventInfo.value = result.data.data;

    if (eventInfo.value.event_type === "DD2" && eventInfo.value.times) {
      eventTimes.value = [...eventInfo.value.times];
    }
  } catch (err) {
    console.error(err);
  }
};

onBeforeMount(() => {
  const eno = route.query.no;
  if (eno) {
    isUpdated.value = true;
    getEventInfo(eno);
  } else {
    eventInfo.value.event_register_date = new Date();
  }
});
</script>

<style scoped>
.event-form {
  max-width: 600px;
  margin: 20px auto;
}
.event-form div {
  margin-bottom: 12px;
}
.event-form label {
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
}
.event-form input,
.event-form textarea {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}
.time-item {
  margin-bottom: 8px;
  padding: 6px;
  border: 1px solid #ccc;
}
.event-form button {
  padding: 8px 16px;
  font-size: 16px;
  margin-top: 6px;
}
</style>
