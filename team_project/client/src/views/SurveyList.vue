<template>
  <section class="p-6 max-w-6xl mx-auto">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold">역할별 제출본 목록</h2>
        <p class="text-gray-500 text-sm">
          역할에 따라 조회 범위가 달라집니다. (1=일반, 2=담당, 3=관리자, 4=시스템)
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- 임시 ROLE / USER 선택 -->
        <label class="text-sm">ROLE</label>
        <select v-model.number="role" class="border px-2 py-1 rounded">
          <option :value="1">1 (일반)</option>
          <option :value="2">2 (담당)</option>
          <option :value="3">3 (관리자)</option>
          <option :value="4">4 (시스템)</option>
        </select>

        <label class="text-sm">USER</label>
        <input
          v-model.number="userId"
          type="number"
          class="border px-2 py-1 rounded w-24"
        />

        <!-- 버튼들 교체 -->
        <MaterialButton color="dark" size="sm" @click="fetchList">
          불러오기
        </MaterialButton>

        <!-- 일반(ROLE=1)만 노출 -->
        <MaterialButton
          v-if="role === 1"
          color="dark"
          size="sm"
          @click="$router.push('/survey/write')"
        >
          조사지 작성하기
        </MaterialButton>
      </div>
    </header>

    <div v-if="loading" class="text-gray-500">불러오는 중...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- 담당자이고, 목록이 비었을 때 안내 -->
    <div
      v-else-if="role === 2 && list.length === 0"
      class="text-gray-600 border rounded p-6"
    >
      아직 배정받지 않았습니다.
    </div>

    <table
      v-else
      class="w-full border-collapse text-sm border border-gray-300 shadow-sm"
    >
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">submit_code</th>
          <th class="border p-2">템플릿코드</th>
          <th class="border p-2">메이저</th>
          <th class="border p-2">세부버전</th>
          <th class="border p-2">작성자</th>
          <th class="border p-2">담당자</th>
          <th class="border p-2">상태</th>
          <th class="border p-2">제출일</th>
          <th class="border p-2">수정일</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in list"
          :key="row.submit_code"
          class="hover:bg-gray-50 cursor-pointer"
          @click="goToDetail(row.submit_code)"
        >
          <td class="border p-2">{{ row.submit_code }}</td>
          <td class="border p-2">{{ row.template_code }}</td>
          <td class="border p-2">{{ row.version_no }}</td>
          <td class="border p-2">{{ row.version_detail_no }}</td>
          <td class="border p-2">{{ row.written_by }}</td>
          <td class="border p-2">{{ row.assi_by ?? "-" }}</td>
          <td class="border p-2">{{ statusLabel(row.status) }}</td>
          <td class="border p-2">{{ fmt(row.submit_at) }}</td>
          <td class="border p-2">{{ fmt(row.updated_at) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 비었을 때 -->
    <div
      v-if="!loading && !error && list.length === 0 && role !== 2"
      class="text-center text-gray-400 py-8"
    >
      조회된 제출본이 없습니다.
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import MaterialButton from "@/components/MaterialButton.vue";

const router = useRouter();

const role = ref(1);
const userId = ref(1);

const list = ref([]);
const loading = ref(false);
const error = ref("");

async function fetchList() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axios.get("/api/survey/submissions", {
      params: { role: role.value, userId: userId.value },
    });

    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.result)
      ? data.result
      : [];

    list.value = rows;
  } catch (e) {
    error.value =
      e?.response?.data?.message || e.message || "목록을 불러오지 못했습니다.";
  } finally {
    loading.value = false;
  }
}

function fmt(v) {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d) ? String(v) : d.toISOString().slice(0, 10);
}

function statusLabel(code) {
  switch (code) {
    case "CA1":
      return "미검토";
    case "CA3":
      return "검토완료";
    default:
      return code || "-";
  }
}

onMounted(fetchList);
watch([role, userId], fetchList);

function goToDetail(submitCode) {
  router.push({
    path: `/survey/submission/${submitCode}`,
    query: { role: role.value, userId: userId.value },
  });
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  border: 1px solid #ddd;
  text-align: center;
}
th {
  background: #f5f5f5;
}
</style>
