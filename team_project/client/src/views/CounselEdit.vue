<template>
  <section class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- 상단 타이틀 -->
    <header class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-2xl font-semibold">상담서 수정</h2>
        <p class="text-sm text-gray-500">제출 코드: {{ submitCode }}</p>
      </div>

      <div class="space-x-2 flex items-center">
        <MaterialButton color="dark" size="sm" @click="reload">
          불러오기
        </MaterialButton>
        <MaterialButton color="dark" size="sm" @click="goBack">
          ← 목록으로
        </MaterialButton>
      </div>
    </header>

    <!-- 로딩/에러 -->
    <div v-if="loading" class="text-sm text-gray-500">불러오는 중...</div>
    <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

    <!-- 본문 -->
    <template v-else>
      <!-- 기본정보 -->
      <div class="border rounded p-4 bg-gray-50 space-y-3">
        <div class="grid grid-cols-2 text-sm gap-2">
          <div>
            이름: <strong>{{ submitInfo.name }}</strong>
          </div>
          <div>생년월일: {{ submitInfo.ssnFront }}</div>
        </div>

        <div class="flex items-center gap-6 text-sm">
          <MaterialButton color="dark" size="sm" @click="openSubmissionDetail">
            조사지 제출일: {{ formattedSubmitAt }}
          </MaterialButton>

          <label class="flex items-center gap-2">
            상담일:
            <input type="date" v-model="mainForm.counselDate" class="input" />
          </label>
        </div>
      </div>

      <!-- 상담 제목 / 내용 -->
      <div class="space-y-4">
        <!-- 상담 제목 -->
        <div>
          <label class="block text-sm mb-1 font-medium">상담 제목</label>
          <MaterialInput
            id="edit-title"
            variant="outline"
            size="default"
            v-model="mainForm.title"
            placeholder="상담 제목을 입력하세요"
          />
        </div>

        <!-- 상담 내용 -->
        <div>
          <label class="block text-sm mb-1 font-medium">상담 내용</label>
          <MaterialTextarea
            id="edit-content"
            variant="outline"
            :rows="5"
            placeholder="상담 내용을 입력하세요..."
            :value="mainForm.content"
            @input="(e) => (mainForm.content = e.target.value)"
          />
        </div>
      </div>

      <!-- 버튼 (추가 / 우선순위 / 완료) -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <MaterialButton color="dark" size="sm" @click="goBack">
            수정 취소
          </MaterialButton>

          <MaterialButton color="dark" size="sm" @click="addRecord">
            + 상담 기록 추가
          </MaterialButton>

          <!-- 우선순위 -->
          <select v-model="priority" class="input w-28">
            <option value="긴급">긴급</option>
            <option value="중점">중점</option>
            <option value="계획">계획</option>
          </select>

          <MaterialButton color="dark" size="sm" @click="submitAll">
            수정 완료
          </MaterialButton>
        </div>
      </div>

      <!-- 추가 상담 기록들 -->
      <div
        v-for="record in records"
        :key="record.id"
        class="border rounded p-4 bg-white space-y-4"
      >
        <div class="flex justify-between items-start">
          <h4 class="font-medium text-sm">상담 기록</h4>

          <MaterialButton
            color="dark"
            size="sm"
            @click="removeRecord(record.id)"
          >
            -
          </MaterialButton>
        </div>

        <div>
          <label class="block text-sm mb-1 font-medium">상담일</label>
          <input type="date" v-model="record.counselDate" class="input" />
        </div>

        <div>
          <label class="block text-sm mb-1 font-medium">상담 제목</label>
          <MaterialInput
            :id="`record-title-${record.id}`"
            variant="outline"
            size="default"
            v-model="record.title"
            placeholder="상담 제목을 입력하세요"
          />
        </div>

        <div>
          <label class="block text-sm mb-1 font-medium">상담 내용</label>
          <MaterialTextarea
            :id="`record-content-${record.id}`"
            variant="outline"
            :rows="3"
            placeholder="상담 내용을 입력하세요..."
            :value="record.content"
            @input="(e) => (record.content = e.target.value)"
          />
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

import MaterialButton from "@/components/MaterialButton.vue";
import MaterialTextarea from "@/components/MaterialTextarea.vue";
import MaterialInput from "@/components/MaterialInput.vue";

const route = useRoute();
const router = useRouter();
const submitCode = Number(route.params.submitCode);

const loading = ref(false);
const error = ref("");

// 기본 정보 / 메인 폼 / 기록 / 우선순위
const submitInfo = ref({
  name: "",
  ssnFront: "",
  submitAt: "",
});

const formattedSubmitAt = computed(() => submitInfo.value.submitAt || "-");

const mainForm = ref({
  counselDate: "",
  title: "",
  content: "",
});

const records = ref([]);
const priority = ref("계획");

// 상담 상세 불러오기 (백엔드 응답 구조는 필요한 대로 맞춰 쓰면 됨)
async function loadData() {
  loading.value = true;
  error.value = "";
  try {
    // 예시: GET /api/counsel/:submitCode 로 상담 상세 조회
    const { data } = await axios.get(`/api/counsel/${submitCode}`);

    if (!data?.success || !data.result) {
      throw new Error(data?.message || "상담 정보를 찾을 수 없습니다.");
    }

    const res = data.result;

    submitInfo.value = res.submit_info || submitInfo.value;

    mainForm.value = {
      counselDate: res.main?.counsel_date || "",
      title: res.main?.title || "",
      content: res.main?.content || "",
    };

    priority.value = res.priority || "계획";

    // 상세 기록들
    records.value =
      (res.details || []).map((d, idx) => ({
        id: Date.now() + idx,
        counselDate: d.counsel_date || "",
        title: d.title || "",
        content: d.content || "",
      })) || [];
  } catch (e) {
    console.error(e);
    error.value = e.message || "상담 정보 조회 중 오류";
  } finally {
    loading.value = false;
  }
}

function reload() {
  loadData();
}

function openSubmissionDetail() {
  window.open(`/survey/submission/${submitCode}`, "_blank");
}
function goBack() {
  router.push({ name: "counselList" });
}

function addRecord() {
  records.value.push({
    id: Date.now(),
    counselDate: "",
    title: "",
    content: "",
  });
}

function removeRecord(id) {
  records.value = records.value.filter((r) => r.id !== id);
}

// 유효성
function validate() {
  if (!mainForm.value.counselDate) return "상담일을 입력해주세요.";
  if (!mainForm.value.title.trim()) return "상담 제목을 입력해주세요.";
  if (!mainForm.value.content.trim()) return "상담 내용을 입력해주세요.";

  for (const r of records.value) {
    if (!r.counselDate) return "추가 상담 기록의 상담일을 입력해주세요.";
    if (!r.title.trim()) return "추가 상담 기록의 제목을 입력해주세요.";
    if (!r.content.trim()) return "추가 상담 기록의 내용을 입력해주세요.";
  }
  return null;
}

// 저장(수정 완료) → /api/counsel/new 재사용 (백엔드에서 upsert 처리)
async function submitAll() {
  const err = validate();
  if (err) {
    alert(err);
    return;
  }

  try {
    const payload = {
      submitCode,
      priority: priority.value,
      mainForm: mainForm.value,
      records: records.value,
    };

    const res = await axios.post("/api/counsel/new", payload);

    if (res.data?.success) {
      alert("상담 수정이 완료되었습니다.");
      router.push({ name: "counselList" });
    } else {
      alert(res.data.message || "수정 실패");
    }
  } catch (e) {
    console.error(e);
    alert("서버 오류: " + (e.response?.data?.message || e.message));
  }
}

// 첫 로딩에 데이터 불러오기
loadData();
</script>
