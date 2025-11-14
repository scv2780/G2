<!-- src/views/PlanList.vue -->
<template>
  <section class="p-6 max-w-5xl mx-auto space-y-4">
    <!-- 상단 타이틀 + 역할 선택 -->
    <header class="flex items-center justify-between mb-2">
      <h2 class="text-2xl font-semibold">지원계획 목록</h2>

      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-600">역할 선택</span>
        <select v-model="role" class="input text-sm w-32">
          <option value="1">1. 일반 사용자</option>
          <option value="2">2. 담당자</option>
          <option value="3">3. 관리자</option>
          <option value="4">4. 시스템</option>
        </select>
      </div>
    </header>

    <!-- 선택된 역할 안내 -->
    <p class="text-xs text-gray-500">현재 역할: {{ roleLabel }}</p>

    <!-- 기본 테이블 -->
    <div class="border rounded-lg overflow-hidden bg-white">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-xs text-gray-600">
          <tr>
            <th class="px-3 py-2 text-left w-14">No</th>
            <th class="px-3 py-2 text-left w-24">제출코드</th>
            <th class="px-3 py-2 text-left w-32">작성자</th>
            <th class="px-3 py-2 text-left w-32">담당자</th>
            <th class="px-3 py-2 text-left w-40">조사지 제출일</th>
            <th class="px-3 py-2 text-left w-40">계획 작성일</th>
            <th class="px-3 py-2 text-left w-24">상태</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, idx) in plans"
            :key="row.planCode || row.submitCode || idx"
            class="border-t"
          >
            <td class="px-3 py-2">
              {{ idx + 1 }}
            </td>
            <td class="px-3 py-2">
              {{ row.submitCode }}
            </td>
            <td class="px-3 py-2">
              {{ row.writerName || "-" }}
            </td>
            <td class="px-3 py-2">
              {{ row.assiName || "-" }}
            </td>
            <td class="px-3 py-2">
              {{ formatDate(row.submitAt) }}
            </td>
            <td class="px-3 py-2">
              {{ formatDate(row.writtenAt) }}
            </td>
            <td class="px-3 py-2">
              {{ row.status || "-" }}
            </td>
          </tr>

          <tr v-if="!plans.length">
            <td colspan="7" class="px-3 py-6 text-center text-gray-500">
              등록된 지원계획이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";

// 역할 선택 (기본: 담당자)
const role = ref("2");

// 역할 라벨
const roleLabel = computed(() => {
  switch (role.value) {
    case "1":
      return "1. 일반 사용자";
    case "2":
      return "2. 담당자";
    case "3":
      return "3. 관리자";
    case "4":
      return "4. 시스템";
    default:
      return role.value;
  }
});

// 목록 데이터
const plans = ref([]);

// 날짜 포맷터 (YYYY-MM-DD만 보여주고 null 이면 '-')
const formatDate = (v) => {
  if (!v) return "-";
  // v가 '2025-11-14T00:00:00.000Z' 같은 형식이어도 앞 10자리만 자르면 됨
  return String(v).slice(0, 10);
};

// 목록 조회
const loadList = async () => {
  try {
    const res = await axios.get("api/plans", {
      params: { role: role.value },
    });
    plans.value = res.data.result || [];
  } catch (e) {
    console.error("지원계획 목록 조회 실패:", e);
  }
};

// 역할 바뀔 때마다 다시 조회
watch(role, () => {
  loadList();
});

// 첫 로딩 때 호출
onMounted(() => {
  loadList();
});
</script>
