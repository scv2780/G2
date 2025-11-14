<!-- src/views/PriorityApproval.vue -->
<template>
  <div class="priority-page">
    <h2 class="priority-title">우선순위 승인 요청 목록</h2>

    <div class="priority-filters">
      <input
        v-model="keyword"
        class="priority-input"
        placeholder="이름/보호자/기관 검색"
        @keyup.enter="searchList"
      />

      <select v-model="state" class="priority-select" @change="searchList">
        <option value="">전체</option>
        <option value="BA1">요청</option>
        <option value="BA2">승인</option>
        <option value="BA3">반려</option>
      </select>

      <select v-model="orderBy" class="priority-select" @change="searchList">
        <option value="latest">최신순</option>
        <option value="oldest">오래된순</option>
        <option value="name">이름순</option>
        <option value="priority">우선순위순</option>
      </select>
    </div>

    <div class="priority-card">
      <!-- 🔹 로딩 중일 때만 표시 -->
      <div v-if="loading" class="priority-loading">불러오는 중...</div>
      <!-- 🔹 로딩이 끝났을 때만 테이블 표시 -->
      <table v-else class="priority-table">
        <thead>
          <tr>
            <th>승인코드</th>
            <th>이름</th>
            <th>보호자</th>
            <th>담당자</th>
            <th>기관</th>
            <th>상담기록</th>
            <th>장애유형</th>
            <th>우선순위</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in list"
            :key="item.approval_code"
            @click="goDetail(item)"
            class="priority-row"
          >
            <td>{{ item.approval_code }}</td>
            <td>{{ item.child_name }}</td>
            <td>{{ item.parent_name }}</td>
            <td>{{ item.manager_name }}</td>
            <td>{{ item.org_name }}</td>
            <td>{{ formatDate(item.counsel_date) }}</td>
            <td>{{ item.disability_type }}</td>
            <td>
              <span
                class="priority-chip"
                :class="priorityChipClass(item.priority_level)"
              >
                {{ codeLabel(item.priority_level) }}
              </span>
            </td>
            <td>
              <span class="priority-badge" :class="stateBadgeClass(item.state)">
                {{ codeLabel(item.state) }}
              </span>
            </td>
          </tr>
          <!-- 🔹 로딩이 끝났고 + 데이터 없을 때만 메시지 -->
          <tr v-if="list.length === 0">
            <td class="priority-empty" colspan="9">데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>
      <!-- 🔹 페이징도 로딩 끝난 뒤에만 -->
      <div v-if="!loading && totalPages > 1" class="priority-pagination">
        <button
          class="priority-page-btn"
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          이전
        </button>

        <span class="priority-page-info">
          {{ page }} / {{ totalPages }} (총 {{ totalCount }}건)
        </span>

        <button
          class="priority-page-btn"
          :disabled="page === totalPages"
          @click="changePage(page + 1)"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const list = ref([]);

const page = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const loading = ref(false);

const totalPages = computed(() =>
  totalCount.value > 0 ? Math.ceil(totalCount.value / pageSize.value) : 1
);

const keyword = ref("");
const state = ref("");
const orderBy = ref("latest"); // 최신순 기본

// 공통코드 매핑
const CODE_LABEL_MAP = {
  // 요청 상태(BA)
  BA1: "요청",
  BA2: "승인",
  BA3: "반려",

  // 우선순위 유형(BB)
  BB1: "긴급",
  BB2: "중점",
  BB3: "준비",
};

// 검색 및 필터링 적용
function searchList() {
  page.value = 1; // 검색하면 페이지 초기화
  loadList();
}

// 코드 → 라벨 변환
function codeLabel(code) {
  if (!code) return "";
  return CODE_LABEL_MAP[code] || code;
}

// 우선순위 칩 색상
function priorityChipClass(level) {
  switch (level) {
    case "BB1": // 긴급
      return "priority-chip-danger";
    case "BB2": // 중점
      return "priority-chip-warning";
    case "BB3": // 준비
      return "priority-chip-info";
    default:
      return "priority-chip-default";
  }
}

// 상태 뱃지 색상
function stateBadgeClass(state) {
  switch (state) {
    case "BA1": // 요청
      return "priority-badge-request";
    case "BA2": // 승인
      return "priority-badge-approve";
    case "BA3": // 반려
      return "priority-badge-reject";
    default:
      return "priority-badge-default";
  }
}

function formatDate(value) {
  if (!value) return "";
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

// 🔹 리스트 로딩 (서버 페이징)
async function loadList() {
  loading.value = true;
  try {
    const res = await axios.get("/api/approvals/priority", {
      // support-plan이면 변경
      params: {
        page: page.value,
        size: pageSize.value,
        keyword: keyword.value,
        state: state.value,
        orderBy: orderBy.value,
      },
    });

    const payload = res.data?.data || {};
    const rows = Array.isArray(payload.rows) ? payload.rows : [];

    list.value = rows;
    totalCount.value = payload.totalCount ?? 0;
  } catch (err) {
    console.error("[PriorityApproval] loadList error:", err);
    list.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
}

// 페이지 변경
function changePage(nextPage) {
  if (nextPage < 1) return;
  if (nextPage > totalPages.value) return;
  if (nextPage === page.value) return;

  page.value = nextPage;
  loadList();
}

// ✅ 각 행 클릭 시 상담 상세로 이동 (모든 상태 이동 가능)
function goDetail(item) {
  router.push({
    name: "counsel-detail", // 이미 라우터에 정의된 상세 페이지
    params: { submitCode: item.submit_code }, // 우선순위 → 제출코드 연결
    query: {
      role: 3, // 관리자 화면에서 여는 거라면 3 유지
      // 필요하면 approvalCode도 같이 넘길 수 있음 (백엔드에서 필요할 때 사용)
      // approvalCode: item.approval_code,
    },
  });
}

onMounted(loadList);
</script>

<style scoped>
.priority-page {
  max-width: 1100px;
  margin: 24px auto 40px;
  padding: 0 16px;
}

.priority-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827;
}

.priority-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  padding: 12px 16px;
}

/* 테이블 기본 */
.priority-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

/* 헤더 */
.priority-table thead th {
  text-align: left;
  padding: 10px 8px;
  font-weight: 600;
  font-size: 12px;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  white-space: nowrap;
}

/* 바디 셀 */
.priority-table tbody td {
  padding: 9px 8px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  vertical-align: middle;
}

/* 행 hover 효과 */
.priority-row {
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    transform 0.06s ease;
}

.priority-row:hover {
  background: #f3f4ff;
  transform: translateY(-1px);
}

/* 빈 데이터 */
.priority-empty {
  text-align: center;
  padding: 14px 0;
  color: #9ca3af;
}

/* 우선순위 칩 */
.priority-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
}

/* 우선순위별 색상 */
.priority-chip-danger {
  background: #fee2e2;
  color: #b91c1c;
}

.priority-chip-warning {
  background: #fef3c7;
  color: #92400e;
}

.priority-chip-info {
  background: #e0f2fe;
  color: #075985;
}

.priority-chip-default {
  background: #e5e7eb;
  color: #4b5563;
}

/* 상태 뱃지 */
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid transparent;
}

/* 요청/승인/반려 색상 */
.priority-badge-request {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #3730a3;
}

.priority-badge-approve {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #166534;
}

.priority-badge-reject {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.priority-badge-default {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #4b5563;
}

.priority-loading {
  font-size: 13px;
  color: #6b7280;
  padding: 8px 4px;
}

/* 페이징 */
.priority-pagination {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4b5563;
}

.priority-page-btn {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  cursor: pointer;
  font-size: 12px;
  transition:
    background-color 0.12s ease,
    transform 0.06s ease,
    box-shadow 0.12s ease;
}

.priority-page-btn:hover:not(:disabled) {
  background: #eef2ff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  transform: translateY(-0.5px);
}

.priority-page-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.priority-page-info {
  min-width: 120px;
  text-align: right;
}

.priority-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}

.priority-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
}

.priority-select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  background: white;
}
</style>
