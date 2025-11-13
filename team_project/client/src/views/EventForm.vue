<template>
  <div class="event-form">
    <h2>이벤트 {{ isUpdated ? "수정" : "등록" }}</h2>
    <form @submit.prevent="submitForm">
      <!-- 기본 정보 -->
      <div class="card">
        <h3>기본 정보</h3>
        <div class="grid-2">
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

          <!-- 모집 기간 -->
          <div>
            <label>모집 시작일</label>
            <input
              type="date"
              v-model="eventInfo.recruit_start_date"
              :min="dateFormat(today, 'yyyy-MM-dd')"
            />
          </div>
          <div>
            <label>모집 종료일</label>
            <input
              type="date"
              v-model="eventInfo.recruit_end_date"
              :min="
                eventInfo.recruit_start_date || dateFormat(today, 'yyyy-MM-dd')
              "
            />
          </div>

          <!-- 이벤트 기간 -->
          <div>
            <label>이벤트 시작일</label>
            <input
              type="date"
              v-model="eventInfo.event_start_date"
              :min="getNextDay(eventInfo.recruit_end_date)"
            />
          </div>
          <div>
            <label>이벤트 종료일</label>
            <input
              type="date"
              v-model="eventInfo.event_end_date"
              :min="eventInfo.event_start_date"
            />
          </div>
        </div>
      </div>

      <!-- 내용 -->
      <div class="card">
        <h3>내용</h3>
        <textarea
          v-model="eventInfo.event_content"
          rows="5"
          required
        ></textarea>
      </div>

      <!-- 세부 예약 이벤트 -->
      <div v-if="eventInfo.event_type === 'DD2'" class="card">
        <h3>세부 예약 이벤트</h3>
        <div v-for="(item, index) in eventTimes" :key="index" class="time-item">
          <div class="grid-2">
            <div>
              <label>세부 이벤트명</label>
              <input
                type="text"
                v-model="item.name"
                placeholder="세부 이벤트명 입력"
              />
            </div>
            <div>
              <label>최대 참여자</label>
              <input
                type="number"
                v-model="item.max_participants"
                placeholder="인원"
              />
            </div>
            <div>
              <label>시작일 + 시간</label>
              <input
                type="datetime-local"
                v-model="item.start"
                :min="eventInfo.event_start_date + 'T00:00'"
              />
            </div>
            <div>
              <label>종료일 + 시간</label>
              <input
                type="datetime-local"
                v-model="item.end"
                :min="item.start"
              />
            </div>
          </div>
          <button type="button" class="btn-danger" @click="removeTime(index)">
            삭제
          </button>
        </div>
        <button type="button" class="btn-primary" @click="addTime">추가</button>
      </div>

      <!-- 첨부파일 -->
      <div class="card">
        <h3>첨부파일</h3>
        <input
          type="file"
          multiple
          @change="handleFileChange"
          class="file-input"
        />
        <ul>
          <li v-for="(file, index) in eventInfo.attachments" :key="index">
            {{ file.name }}
            <button type="button" class="btn-danger" @click="removeFile(index)">
              삭제
            </button>
          </li>
        </ul>
      </div>

      <!-- 서브 매니저 -->
      <div class="card">
        <h3>서브 매니저</h3>
        <div
          v-for="(manager, index) in eventInfo.sub_managers"
          :key="index"
          class="sub-manager-item"
        >
          <input
            type="number"
            v-model="manager.user_code"
            placeholder="회원코드 입력"
          />
          <button
            type="button"
            class="btn-danger"
            @click="removeSubManager(index)"
          >
            삭제
          </button>
        </div>
        <button type="button" class="btn-primary" @click="addSubManager">
          추가
        </button>
      </div>

      <!-- 상태 -->
      <div class="grid-2 card">
        <div>
          <label>모집 상태</label>
          <input type="text" v-model="eventInfo.recruit_status" readonly />
        </div>
        <div>
          <label>등록 상태</label>
          <input type="text" v-model="eventInfo.register_status" readonly />
        </div>
      </div>

      <button type="submit" class="btn-submit">
        {{ isUpdated ? "수정" : "등록" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import dateFormat from "@/utils/dateFormat";

const route = useRoute();
const router = useRouter();

const today = new Date();
today.setHours(0, 0, 0, 0);

// 다음날 계산 함수
const getNextDay = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  d.setDate(d.getDate() + 1);
  return dateFormat(d, "yyyy-MM-dd");
};

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
  recruit_start_date: "",
  recruit_end_date: "",
  event_start_date: "",
  event_end_date: "",
  recruit_status: "DC1",
  register_status: "DE1",
  attachments: [],
  sub_managers: [],
});

const eventTimes = ref([]);
const isUpdated = ref(false);
const formattedRegisterDate = computed(() =>
  dateFormat(eventInfo.value.event_register_date, "yyyy-MM-dd")
);

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  eventInfo.value.attachments.push(...files);
};
const removeFile = (index) => eventInfo.value.attachments.splice(index, 1);

const addSubManager = () =>
  eventInfo.value.sub_managers.push({ user_code: "" });
const removeSubManager = (index) =>
  eventInfo.value.sub_managers.splice(index, 1);

const addTime = () => {
  eventTimes.value.push({
    name: "",
    max_participants: 0,
    start: "",
    end: "",
  });
};
const removeTime = (index) => eventTimes.value.splice(index, 1);

// 세부 이벤트 총 참여자 합계 계산
const totalSubParticipants = computed(() =>
  eventTimes.value.reduce(
    (sum, e) => sum + (Number(e.max_participants) || 0),
    0
  )
);

// 등록/수정
const submitForm = async () => {
  // ✅ 세부 이벤트 인원 합계 체크
  if (eventInfo.value.event_type === "DD2") {
    if (totalSubParticipants.value > Number(eventInfo.value.max_participants)) {
      alert(
        `세부 이벤트 총 인원(${totalSubParticipants.value}명)이 이벤트 최대 인원(${eventInfo.value.max_participants}명)을 초과했습니다.`
      );
      return;
    }
  }

  try {
    const formData = new FormData();

    const eventData = {
      ...eventInfo.value,
      event_register_date: formattedRegisterDate.value,
      sub_events:
        eventInfo.value.event_type === "DD2"
          ? eventTimes.value.map((e) => ({
              sub_event_name: e.name,
              sub_recruit_count: e.max_participants,
              sub_event_start_date: e.start,
              sub_event_end_date: e.end,
            }))
          : [],
    };

    formData.append("eventInfo", JSON.stringify(eventData));
    eventInfo.value.attachments.forEach((file) =>
      formData.append("attachments", file)
    );
    formData.append(
      "sub_managers",
      JSON.stringify(eventInfo.value.sub_managers)
    );

    if (isUpdated.value) {
      await axios.put(`/api/event/${eventInfo.value.event_code}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("이벤트 수정 완료!");
    } else {
      await axios.post("/api/event", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("이벤트 등록 완료!");
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
  max-width: 900px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}
.card {
  border: 1px solid #ccc;
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #fafafa;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 20px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
}
input,
select,
textarea {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
textarea {
  resize: vertical;
}
.time-item,
.sub-manager-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px dashed #aaa;
  border-radius: 6px;
  background-color: #fff;
}
button {
  padding: 6px 12px;
  margin-top: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary {
  background-color: #1976d2;
  color: white;
}
.btn-danger {
  background-color: #d32f2f;
  color: white;
}
.btn-submit {
  width: 100%;
  background-color: #4caf50;
  color: white;
  font-size: 18px;
  padding: 10px;
  margin-top: 10px;
}
.file-input {
  margin-bottom: 10px;
}
</style>
