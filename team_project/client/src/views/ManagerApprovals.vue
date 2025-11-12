<!-- src/views/ManagerApprovals.vue -->
<template>
  <div>
    <h2>승인 및 요청 목록</h2>

    <!-- 검색/필터 -->
    <div>
      <input
        v-model.trim="keyword"
        placeholder="이름/아이디/기관명/연락처/이메일 검색"
        @keyup.enter="fetchList"
      />
      <select v-model="state" @change="onFilterChange">
        <option value="">전체</option>
        <option value="REQ">요청</option>
        <option value="APP">승인</option>
        <option value="REJ">반려</option>
      </select>
      <button @click="fetchList">조회</button>
    </div>

    <!-- 테이블 -->
    <table>
      <thead>
        <tr>
          <th>승인코드</th>
          <th>이름</th>
          <th>아이디</th>
          <th>기관명</th>
          <th>연락처</th>
          <th>이메일</th>
          <th>상태</th>
          <th>요청일</th>
          <th>승인일</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!loading && rows.length === 0">
          <td colspan="9">데이터가 없습니다.</td>
        </tr>
        <tr v-for="r in rows" :key="r.approval_code">
          <td>{{ r.approval_code }}</td>
          <td>{{ r.user_name }}</td>
          <td>{{ r.login_id }}</td>
          <td>{{ r.organization_name }}</td>
          <td>{{ r.phone }}</td>
          <td>{{ r.email }}</td>
          <td>{{ stateLabel(r.state) }}</td>
          <td>{{ fmtDate(r.request_date) }}</td>
          <td>{{ r.approval_date ? fmtDate(r.approval_date) : "-" }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 페이징 -->
    <div>
      <button :disabled="page <= 1 || loading" @click="goPage(page - 1)">
        이전
      </button>
      <span>{{ page }}</span>
      <button
        :disabled="rows.length < size || loading"
        @click="goPage(page + 1)"
      >
        다음
      </button>
    </div>

    <div v-if="error" role="alert">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

/* 상태 */
const rows = ref([]);
const loading = ref(false);
const error = ref("");

/* 필터/페이지 */
const state = ref(""); // '', 'REQ', 'APP', 'REJ'
const keyword = ref("");
const page = ref(1);
const size = ref(20);

/* 헬퍼 */
function stateLabel(s) {
  switch (s) {
    case "REQ":
      return "요청";
    case "APP":
      return "승인";
    case "REJ":
      return "반려";
    default:
      return s || "-";
  }
}
function fmtDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* 목록 불러오기 */
async function fetchList() {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get("/api/approvals", {
      params: {
        type: "ORG_MANAGER",
        state: state.value,
        keyword: keyword.value,
        page: page.value,
        size: size.value,
      },
    });
    rows.value = Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    console.error(e);
    error.value = "목록을 불러오지 못했습니다.";
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

/* 페이지 이동 */
function goPage(p) {
  if (p < 1) return;
  page.value = p;
  fetchList();
}
function onFilterChange() {
  page.value = 1;
  fetchList();
}

onMounted(fetchList);
</script>
