<template>
  <section class="p-6">
    <h2 class="text-2xl font-semibold mb-4">버전별 조사지 목록</h2>

    <div v-if="loading">불러오는 중...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <table v-else class="w-full border-collapse">
      <thead>
        <tr>
          <th class="border p-2">template_code</th>
          <th class="border p-2">version_no</th>
          <th class="border p-2">status</th>
          <th class="border p-2">created_by</th>
          <th class="border p-2">created_at</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in list" :key="row.template_code">
          <td class="border p-2">{{ row.template_code }}</td>
          <td class="border p-2">{{ row.version_no }}</td>
          <td class="border p-2">{{ row.status }}</td>
          <td class="border p-2">{{ row.created_by }}</td>
          <td class="border p-2">{{ row.created_at?.slice?.(0, 10) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 text-right space-x-2">
      <!-- 관리자용 -->
      <button @click="goToNew" class="border px-4 py-2 rounded bg-black text-white">
        조사지 제작하기
      </button>
      <!-- ✅ 일반사용자용 -->
      <button @click="goToWrite" class="border px-4 py-2 rounded bg-gray-800 text-white">
        조사지 작성하기
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const list = ref([]);
const loading = ref(false);
const error = ref(null);

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await axios.get("/api/survey");
    list.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = e.message || "목록 조회 중 오류";
  } finally {
    loading.value = false;
  }
});

function goToNew() {
  router.push("/survey/new");
}
function goToWrite() {
  router.push("/survey/write"); // ✅ 새 페이지로 이동
}
</script>
