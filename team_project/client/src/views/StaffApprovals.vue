<!-- src/views/StaffApprovals.vue -->
<template>
  <div class="apv-page">
    <h2 class="apv-title">기관 담당자 승인 및 요청 목록</h2>

    <!-- 검색/필터 -->
    <div class="apv-toolbar">
      <div class="apv-filters">
        <input
          v-model.trim="keyword"
          class="apv-input"
          placeholder="이름/아이디/기관명/연락처/이메일 검색"
          @keyup.enter="fetchList"
        />
        <select v-model="state" class="apv-select" @change="onFilterChange">
          <option value="">전체</option>
          <option value="BA1">요청</option>
          <option value="BA2">승인</option>
          <option value="BA3">반려</option>
        </select>
      </div>
      <button class="apv-btn apv-btn-outline" @click="fetchList">조회</button>
    </div>

    <!-- 테이블 -->
    <div class="apv-table-wrap">
      <table class="apv-table">
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
            <th>처리일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="10" class="apv-empty">데이터가 없습니다.</td>
          </tr>
          <tr v-for="r in rows" :key="r.approval_code">
            <td>{{ r.approval_code }}</td>
            <td>{{ r.user_name }}</td>
            <td>{{ r.login_id }}</td>
            <td>{{ r.organization_name }}</td>
            <td>{{ r.phone }}</td>
            <td>{{ r.email }}</td>
            <td>
              <span :class="['apv-state-pill', `apv-state-${r.state}`]">
                {{ stateLabel(r.state) }}
              </span>
            </td>
            <td>{{ fmtDate(r.request_date) }}</td>
            <td>{{ r.approval_date ? fmtDate(r.approval_date) : "-" }}</td>

            <!-- 요청 상태(BA1)인 경우에만 승인/반려 버튼 -->
            <td class="apv-actions-cell">
              <template v-if="r.state === 'BA1'">
                <button
                  class="apv-btn apv-btn-xs apv-btn-primary"
                  @click="onApprove(r)"
                >
                  승인
                </button>
                <button
                  class="apv-btn apv-btn-xs apv-btn-danger"
                  @click="onReject(r)"
                >
                  반려
                </button>
              </template>
              <template v-else>
                <span class="apv-muted">-</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 반려 사유 모달 -->
    <div
      v-if="isRejectOpen"
      class="apv-modal-backdrop"
      @click.self="cancelReject"
    >
      <div class="apv-modal">
        <h3 class="apv-modal-title">반려 사유 입력</h3>
        <p class="apv-modal-sub">
          승인코드: <b>{{ rejectTarget?.approval_code }}</b> &nbsp;/ 신청자:
          <b>{{ rejectTarget?.user_name }}</b>
        </p>

        <textarea
          v-model.trim="rejectReason"
          rows="4"
          class="apv-textarea"
          placeholder="반려 사유를 입력하세요."
        ></textarea>

        <div class="apv-modal-actions">
          <button class="apv-btn" @click="cancelReject">취소</button>
          <button class="apv-btn apv-btn-primary" @click="confirmReject">
            반려 확정
          </button>
        </div>
      </div>
    </div>

    <!-- 페이징 -->
    <div class="apv-pagination">
      <button
        class="apv-btn apv-btn-xs"
        :disabled="page <= 1 || loading"
        @click="goPage(page - 1)"
      >
        이전
      </button>
      <span class="apv-page-text">{{ page }}</span>
      <button
        class="apv-btn apv-btn-xs"
        :disabled="rows.length < size || loading"
        @click="goPage(page + 1)"
      >
        다음
      </button>
    </div>

    <div v-if="error" class="apv-error" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const API_BASE = "/api/approvals/staff";

/* 상태 */
const rows = ref([]);
const loading = ref(false);
const error = ref("");

/* 필터/페이지 */
const state = ref(""); // '', 'BA1', 'BA2', 'BA3'
const keyword = ref("");
const page = ref(1);
const size = ref(20);

/* 반려 모달 상태 */
const isRejectOpen = ref(false);
const rejectReason = ref("");
const rejectTarget = ref(null);

/* 헬퍼 */
function stateLabel(s) {
  switch (s) {
    case "BA1":
      return "요청";
    case "BA2":
      return "승인";
    case "BA3":
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
    const res = await axios.get(API_BASE, {
      params: {
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

/* 승인/반려 버튼 */
async function onApprove(row) {
  if (
    !confirm(
      `[${row.approval_code}] ${row.user_name} (기관 담당자) 승인 처리할까요?`
    )
  )
    return;
  try {
    await axios.put(
      `${API_BASE}/${encodeURIComponent(row.approval_code)}/approve`
    );
    alert("승인 처리되었습니다.");
    await fetchList();
  } catch (e) {
    console.error(e);
    alert("승인 처리 중 오류가 발생했습니다.");
  }
}

function onReject(row) {
  rejectTarget.value = row;
  rejectReason.value = "";
  isRejectOpen.value = true;
}

function cancelReject() {
  isRejectOpen.value = false;
  rejectTarget.value = null;
  rejectReason.value = "";
}

async function confirmReject() {
  if (!rejectTarget.value) return;
  if (!rejectReason.value.trim()) {
    alert("반려 사유를 입력하세요.");
    return;
  }

  try {
    await axios.put(
      `${API_BASE}/${encodeURIComponent(
        rejectTarget.value.approval_code
      )}/reject`,
      {
        reason: rejectReason.value,
      }
    );
    alert("반려 처리되었습니다.");
    isRejectOpen.value = false;
    rejectTarget.value = null;
    rejectReason.value = "";
    await fetchList();
  } catch (e) {
    console.error(e);
    alert("반려 처리 중 오류가 발생했습니다.");
  }
}

onMounted(fetchList);
</script>

<style scoped>
/* === ManagerApprovals.vue 와 동일 스타일 === */
.apv-page {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px 40px;
}

.apv-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

/* 상단 툴바 */
.apv-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.apv-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.apv-input,
.apv-select {
  min-width: 220px;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid #d7dce5;
  font-size: 13px;
  outline: none;
  background: #fff;
}

.apv-input:focus,
.apv-select:focus {
  border-color: #7ea6f6;
  box-shadow: 0 0 0 1px rgba(126, 166, 246, 0.25);
}

/* 버튼 공통 */
.apv-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #d2d6e0;
  background: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: 0.12s ease-in-out;
  white-space: nowrap;
}

.apv-btn:hover {
  filter: brightness(0.98);
}

.apv-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 사이즈 작은 버튼 */
.apv-btn-xs {
  padding: 4px 8px;
  font-size: 11px;
}

/* 버튼 스타일 변형 */
.apv-btn-primary {
  background: #7ea6f6;
  border-color: #7ea6f6;
  color: #fff;
}

.apv-btn-primary:hover {
  filter: brightness(0.96);
}

.apv-btn-danger {
  background: #f76c6c;
  border-color: #f76c6c;
  color: #fff;
}

.apv-btn-danger:hover {
  filter: brightness(0.96);
}

.apv-btn-outline {
  background: #ffffff;
  border-color: #7ea6f6;
  color: #315fbf;
}

/* 테이블 */
.apv-table-wrap {
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
  border: 1px solid #e2e7f0;
}

.apv-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.apv-table thead {
  background: #f5f7fb;
}

.apv-table th,
.apv-table td {
  padding: 9px 10px;
  border-bottom: 1px solid #edf2f7;
  text-align: left;
}

.apv-table th {
  font-weight: 600;
  color: #4a5568;
  white-space: nowrap;
}

.apv-table tbody tr:hover {
  background: #f9fbff;
}

.apv-empty {
  text-align: center;
  padding: 14px 0;
  color: #6b7280;
}

/* 상태 Pill */
.apv-state-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
}

.apv-state-BA1 {
  background: #fff7e6;
  color: #b7791f;
  border: 1px solid #f6e3b5;
}

.apv-state-BA2 {
  background: #e6fffa;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.apv-state-BA3 {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.apv-actions-cell {
  display: flex;
  gap: 4px;
  align-items: center;
}

.apv-muted {
  color: #9ca3af;
  font-size: 12px;
}

/* 모달 */
.apv-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 9999;
}

.apv-modal {
  width: min(460px, 92vw);
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 18px 16px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.35);
  border: 1px solid #e2e7f0;
}

.apv-modal-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.apv-modal-sub {
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 10px;
}

.apv-textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #d7dce5;
  padding: 8px 10px;
  font-size: 13px;
  resize: vertical;
  min-height: 90px;
}

.apv-textarea:focus {
  outline: none;
  border-color: #7ea6f6;
  box-shadow: 0 0 0 1px rgba(126, 166, 246, 0.25);
}

.apv-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* 페이징/에러 */
.apv-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.apv-page-text {
  font-size: 13px;
}

.apv-error {
  margin-top: 8px;
  color: #b91c1c;
  font-size: 12px;
}
</style>
