<template>
  <div class="event-list">
    <h2>이벤트 목록</h2>
    <button @click="$router.push('/event/add')">이벤트 등록</button>
    <table>
      <thead>
        <tr>
          <th>이벤트 코드</th>
          <th>이벤트 타입</th>
          <th>이벤트 이름</th>
          <th>내용</th>
          <th>기관 코드</th>
          <th>메인 매니저 코드</th>
          <th>등록일</th>
          <th>이벤트 장소</th>
          <th>대상</th>
          <th>최대 참여자</th>
          <th>모집 시작일</th>
          <th>모집 종료일</th>
          <th>이벤트 시작일</th>
          <th>이벤트 종료일</th>
          <th>모집 상태</th>
          <th>등록 상태</th>
          <th>수정</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in events" :key="event.event_code">
          <td>{{ event.event_code }}</td>
          <td>{{ event.event_type }}</td>
          <td>{{ event.event_name }}</td>
          <td>{{ event.event_content }}</td>
          <td>{{ event.org_code }}</td>
          <td>{{ event.user_code }}</td>
          <td>{{ formatDate(event.event_register_date) }}</td>
          <td>{{ event.event_location }}</td>
          <td>{{ event.target_audience }}</td>
          <td>{{ event.max_participants }}</td>
          <td>{{ formatDate(event.recruit_start_date) }}</td>
          <td>{{ formatDate(event.recruit_end_date) }}</td>
          <td>{{ formatDateTime(event.event_start_date) }}</td>
          <td>{{ formatDateTime(event.event_end_date) }}</td>
          <td>{{ event.recruit_status }}</td>
          <td>{{ event.register_status }}</td>
          <td>
            <button @click="editEvent(event.event_code)">수정</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import dateFormat from "@/utils/dateFormat";
import { useRouter } from "vue-router";

const router = useRouter();
const events = ref([]);

// 안전하게 null 체크하며 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateFormat(dateStr, "yyyy-MM-dd");
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
};

const fetchEvents = async () => {
  try {
    const result = await axios.get("/api/event"); // /event 기반으로 통일
    console.log(result.data);
    events.value = result.data.data;
  } catch (err) {
    console.error(err);
  }
};

const editEvent = (eno) => {
  router.push({ path: "/event/add", query: { no: eno } }); // 등록/수정 페이지 이동
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.event-list {
  max-width: 800px;
  margin: 20px auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px;
  border: 1px solid #ccc;
  text-align: center;
}
button {
  padding: 4px 8px;
}
</style>
