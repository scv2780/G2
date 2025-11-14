<template>
  <section class="p-6 max-w-5xl mx-auto">
    <!-- 헤더 -->
    <header class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-semibold">상담 목록</h2>

      <!-- 역할 선택 -->
      <div class="flex items-center gap-2">
        <label for="role" class="text-sm text-gray-700">내 역할</label>
        <select
          id="role"
          v-model.number="selectedRole"
          class="border rounded px-2 py-1 text-sm"
        >
          <option :value="2">담당자 (2)</option>
          <option :value="3">관리자 (3)</option>
          <option :value="4">시스템 (4)</option>
        </select>
      </div>
    </header>

    <!-- 상태 표시 -->
    <div v-if="loading">불러오는 중...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="list.length === 0">상담 내역이 없습니다.</div>

    <!-- 상담 목록 카드 + 테이블 -->
    <div v-else class="card shadow-sm">
      <div class="card-body p-0">
        <table class="w-full text-left text-sm card-table">
          <thead>
            <tr>
              <th class="p-3">제출번호</th>
              <th class="p-3">조사지 작성자</th>
              <th class="p-3">담당자</th>
              <th class="p-3">조사지 제출일</th>
              <th class="p-3">상담일</th>
              <th class="p-3">상담 작성일</th>
              <th class="p-3">상태</th>
              <!-- 🔹 열은 고정, 텍스트만 조건부 -->
              <th class="p-3 w-24 text-center">
                <span v-if="isAssigneeRole">액션</span>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in list"
              :key="row.submit_code"
              class="row-card"
              @click="goDetail(row)"
            >
              <td class="p-3 align-middle">{{ row.submit_code }}</td>
              <td class="p-3 align-middle">{{ row.writer_name }}</td>
              <td class="p-3 align-middle">{{ row.assi_name }}</td>
              <td class="p-3 align-middle">
                {{ formatDate(row.submit_at) }}
              </td>

              <!-- 🔥 임시저장(CB1)일 때는 상담일 / 작성일 숨김 -->
              <td class="p-3 align-middle">
                {{
                  isTempStatus(row.status) ? "-" : formatDate(row.counsel_date)
                }}
              </td>
              <td class="p-3 align-middle">
                {{
                  isTempStatus(row.status)
                    ? "-"
                    : formatDate(row.note_created_at)
                }}
              </td>

              <td class="p-3 align-middle">
                <!-- CB4(반려)일 때만 클릭 가능 + 모달 오픈 -->
                <span
                  v-if="row.status === 'CB4'"
                  class="text-red-600 underline cursor-pointer"
                  @click.stop="openRejectReason(row)"
                >
                  {{ statusLabel(row.status) }}
                </span>

                <!-- 나머지 상태는 그냥 텍스트 -->
                <span v-else>
                  {{ statusLabel(row.status) }}
                </span>
              </td>

              <!-- 🔹 버튼 열: 항상 존재, 내용만 조건부 -->
              <td class="p-3 align-middle text-center">
                <template v-if="isAssigneeRole">
                  <!-- CB1, CB2 → 작성하기 -->
                  <MaterialButton
                    v-if="
                      normStatus(row.status) === 'CB2' ||
                      normStatus(row.status) === 'CB1'
                    "
                    color="dark"
                    size="sm"
                    @click.stop="goWrite(row)"
                  >
                    작성하기
                  </MaterialButton>

                  <!-- CB3 → 수정하기 -->
                  <MaterialButton
                    v-else-if="normStatus(row.status) === 'CB3'"
                    color="dark"
                    size="sm"
                    @click.stop="goEdit(row)"
                  >
                    수정하기
                  </MaterialButton>
                  <!-- 🔥 CB4(반려) → 재수정하기 -->
                  <MaterialButton
                    v-else-if="normStatus(row.status) === 'CB4'"
                    color="dark"
                    size="sm"
                    @click.stop="goEdit(row)"
                  >
                    재수정하기
                  </MaterialButton>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 🔻 반려 사유 모달 -->
    <div v-if="rejectReasonModalOpen" class="modal-overlay">
      <div class="modal-container">
        <h3 class="text-lg font-semibold mb-3">반려 사유</h3>

        <div v-if="rejectReasonLoading" class="text-sm text-gray-500">
          불러오는 중...
        </div>

        <div v-else-if="rejectReasonError" class="text-sm text-red-600">
          {{ rejectReasonError }}
        </div>

        <div
          v-else
          class="text-sm whitespace-pre-line text-gray-800 max-h-60 overflow-y-auto border rounded px-3 py-2 bg-gray-50"
        >
          {{ rejectReasonText || "등록된 반려 사유가 없습니다." }}
        </div>

        <div class="modal-actions mt-4 flex justify-end gap-2">
          <MaterialButton
            color="dark"
            size="sm"
            @click="closeRejectReasonModal"
          >
            닫기
          </MaterialButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import MaterialButton from "@/components/MaterialButton.vue";

const router = useRouter();
const currentUserId = 2;

const selectedRole = ref(2);
const list = ref([]);
const loading = ref(false);
const error = ref(null);

// 🔻 반려 사유 모달 상태
const rejectReasonModalOpen = ref(false);
const rejectReasonText = ref("");
const rejectReasonLoading = ref(false);
const rejectReasonError = ref("");

// 반려 사유 모달 열기 + 서버에서 내용 조회
async function openRejectReason(row) {
  rejectReasonModalOpen.value = true;
  rejectReasonText.value = "";
  rejectReasonError.value = "";
  rejectReasonLoading.value = true;

  try {
    const { data } = await axios.get(
      `/api/counsel/${row.submit_code}/rejection-reason`
    );

    if (data?.success === false) {
      throw new Error(data.message || "반려 사유를 불러오지 못했습니다.");
    }

    // 백엔드에서 어떤 구조로 주는지에 따라 둘 중 하나에 걸리게
    rejectReasonText.value =
      data?.result?.rejection_reason ?? data?.rejection_reason ?? "";
  } catch (e) {
    console.error(e);
    rejectReasonError.value =
      e.response?.data?.message || e.message || "반려 사유 조회 중 오류";
  } finally {
    rejectReasonLoading.value = false;
  }
}

function closeRejectReasonModal() {
  rejectReasonModalOpen.value = false;
}

// 🔹 담당자 역할 여부 (2이면 true)
const isAssigneeRole = computed(() => Number(selectedRole.value) === 2);

// 🔹 status 정규화 (혹시 모를 공백 / 소문자 대비)
function normStatus(raw) {
  return (raw ?? "").toString().trim().toUpperCase();
}

// 🔹 임시저장 상태인지 여부 (CB1)
function isTempStatus(code) {
  return normStatus(code) === "CB1";
}

function formatDate(val) {
  return val?.slice?.(0, 10) || "-";
}

function statusLabel(code) {
  switch (normStatus(code)) {
    case "CB1":
      return "상담전"; // 임시저장이지만 목록에선 상담전으로 표시
    case "CB2":
      return "상담전";
    case "CB3":
      return "검토전";
    case "CB4":
      return "반려";
    case "CB5":
      return "검토완료";
    case "CB6":
      return "재승인요청";
    default:
      return code || "-";
  }
}

async function fetchList() {
  loading.value = true;
  error.value = null;

  try {
    const params = {
      role: selectedRole.value,
      userId: currentUserId,
    };

    const { data } = await axios.get("/api/counsel", { params });
    list.value = Array.isArray(data?.result) ? data.result : [];
  } catch (e) {
    error.value = e.message || "상담 목록 조회 중 오류";
    list.value = [];
  } finally {
    loading.value = false;
  }
}

function goWrite(row) {
  router.push({
    name: "counsel-new",
    params: { submitCode: row.submit_code },
  });
}

function goEdit(row) {
  router.push({
    name: "counsel-edit",
    params: { submitCode: row.submit_code },
  });
}

function goDetail(row) {
  router.push({
    name: "counsel-detail",
    params: { submitCode: row.submit_code },
    query: { role: selectedRole.value },
  });
}

onMounted(fetchList);
watch(selectedRole, fetchList);
</script>

<style scoped>
.card {
  display: inline-block; /* 내용 너비에만 맞춤 */
  width: auto;
  border-radius: 1rem;
  border: 1px solid #e5e7eb; /* 연한 회색 테두리 */
  background-color: #ffffff;
  overflow: hidden;
}

/* 테이블 전체 */
.card-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  display: table;
}

/* 헤더 */
.card-table thead tr {
  background-color: #f3f4f6; /* 연한 회색 */
}

.card-table th {
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

/* 바디 셀 */
.card-table td {
  border-bottom: 1px solid #f1f5f9;
  color: #111827;
}

/* 마지막 행 바닥선 제거 느낌 살짝 */
.card-table tbody tr:last-child td {
  border-bottom: none;
}

/* 행을 카드처럼 살짝 떠보이게 */
.row-card {
  transition:
    box-shadow 0.15s ease,
    transform 0.1s ease,
    background-color 0.15s ease;
  cursor: pointer;
}

.row-card:hover {
  background-color: #f9fafb;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-container {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.35);
}
</style>
