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
              <th class="p-3">조사지 작성자</th>
              <th class="p-3">담당자</th>
              <th class="p-3">조사지 제출일</th>
              <th class="p-3">상담일</th>
              <th class="p-3">상담 작성일</th>
              <th class="p-3">상태</th>
              <th class="p-3 w-24 text-center">액션</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in list"
              :key="row.submit_code"
              class="row-card"
              @click="goDetail(row)"
            >
              <td class="p-3 align-middle">{{ row.writer_name }}</td>
              <td class="p-3 align-middle">{{ row.assi_name }}</td>
              <td class="p-3 align-middle">
                {{ formatDate(row.submit_at) }}
              </td>
              <td class="p-3 align-middle">
                {{ formatDate(row.counsel_date) }}
              </td>
              <td class="p-3 align-middle">
                {{ formatDate(row.note_created_at) }}
              </td>

              <td class="p-3 align-middle">
                {{ row.status }}
              </td>

              <!-- 버튼 영역 -->
              <td class="p-3 align-middle text-center">
                <template v-if="selectedRole === 2">
                  <!-- BEFORE → 작성하기 -->
                  <MaterialButton
                    v-if="row.status === 'BEFORE'"
                    color="dark"
                    size="sm"
                    @click.stop="goWrite(row)"
                  >
                    작성하기
                  </MaterialButton>

                  <!-- REQ → 수정하기 -->
                  <MaterialButton
                    v-else-if="row.status === 'REQ'"
                    color="dark"
                    size="sm"
                    @click.stop="goEdit(row)"
                  >
                    수정하기
                  </MaterialButton>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import MaterialButton from "@/components/MaterialButton.vue";

const router = useRouter();
const currentUserId = 2;

const selectedRole = ref(2); // 기본: 담당자
const list = ref([]);
const loading = ref(false);
const error = ref(null);

function formatDate(val) {
  return val?.slice?.(0, 10) || "-";
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
  border-radius: 1rem;
  border: 1px solid #e5e7eb; /* 연한 회색 테두리 */
  background-color: #ffffff;
}

/* 테이블 전체 */
.card-table {
  border-collapse: separate;
  border-spacing: 0;
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
</style>
