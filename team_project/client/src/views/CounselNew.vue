<template>
  <section class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- 상단 타이틀 -->
    <header class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">상담서 작성</h2>

      <div class="space-x-2 flex items-center">
        <MaterialButton color="dark" size="sm" @click="handleLoad">
          불러오기
        </MaterialButton>
        <MaterialButton color="dark" size="sm" @click="handleTempSave">
          임시 저장
        </MaterialButton>
      </div>
    </header>

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
          id="main-title"
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
          id="main-content"
          variant="outline"
          :rows="5"
          placeholder="상담 내용을 입력하세요..."
          :value="mainForm.content"
          @input="(e) => (mainForm.content = e.target.value)"
        />
      </div>

      <!-- ✅ 첨부 파일 영역 -->
      <div>
        <label class="block text-sm mb-1 font-medium">첨부 파일</label>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          @change="onMainFilesChange"
          class="block w-full text-sm"
        />
        <p class="mt-1 text-xs text-gray-500">
          * 여러 개 파일을 한 번에 선택하거나, 나눠서 여러 번 선택할 수
          있습니다.
        </p>

        <!-- 선택된 파일 목록 -->
        <ul
          v-if="mainFiles.length"
          class="mt-2 text-xs text-gray-700 space-y-1"
        >
          <li
            v-for="(file, idx) in mainFiles"
            :key="file.name + '_' + file.lastModified + '_' + idx"
            class="flex items-center justify-between gap-2"
          >
            <span class="truncate">
              • {{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)
            </span>
            <button
              type="button"
              class="shrink-0 px-2 py-0.5 border rounded text-[11px] text-gray-600 hover:bg-gray-100"
              @click="removeMainFile(idx)"
            >
              삭제
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- 버튼 3종 -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-3">
        <MaterialButton color="dark" size="sm" @click="goBack">
          작성 취소
        </MaterialButton>

        <MaterialButton color="dark" size="sm" @click="addRecord">
          + 상담 기록 추가
        </MaterialButton>

        <!-- 우선순위 선택 -->
        <select v-model="priority" class="input w-28">
          <option value="긴급">긴급</option>
          <option value="중점">중점</option>
          <option value="계획">계획</option>
        </select>

        <!-- 작성 완료 -->
        <MaterialButton color="dark" size="sm" @click="submitAll">
          작성 완료
        </MaterialButton>
      </div>
    </div>

    <!-- 추가 상담 기록 -->
    <div
      v-for="record in records"
      :key="record.id"
      class="border rounded p-4 bg-white space-y-4"
    >
      <div class="flex justify-between items-start">
        <h4 class="font-medium text-sm">추가 상담 기록</h4>

        <MaterialButton color="dark" size="sm" @click="removeRecord(record.id)">
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
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

import MaterialButton from "@/components/MaterialButton.vue";
import MaterialTextarea from "@/components/MaterialTextarea.vue";
import MaterialInput from "@/components/MaterialInput.vue";

const route = useRoute();
const router = useRouter();
const submitCode = Number(route.params.submitCode);

// 기본 정보
const submitInfo = ref({
  name: "",
  ssnFront: "",
  submitAt: "",
});

const formattedSubmitAt = computed(() => {
  const v = submitInfo.value.submitAt;
  return v ? v.slice(0, 10) : "-";
});

// 메인 폼
const mainForm = ref({
  counselDate: "",
  title: "",
  content: "",
});

// ✅ 메인 상담 첨부 파일들
const mainFiles = ref([]); // File[]
const fileInputRef = ref(null); // <input type="file">

// 추가 기록들
const records = ref([]);
const priority = ref("계획");

const loading = ref(false);
const error = ref("");

// 기본정보 로딩
async function loadData() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await axios.get(`/api/counsel/${submitCode}`);

    if (!data?.success || !data.result) {
      throw new Error(data?.message || "상담 기본 정보를 찾을 수 없습니다.");
    }

    const res = data.result;

    if (res.submit_info) {
      submitInfo.value = res.submit_info;
    }
  } catch (e) {
    console.error(e);
    error.value = e.message || "상담 기본 정보 조회 중 오류";
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

// ✅ 파일 변경 핸들러 (기존 + 새 파일 누적)
function onMainFilesChange(e) {
  const files = Array.from(e.target.files || []);

  const newOnes = files.filter(
    (f) =>
      !mainFiles.value.some(
        (ex) =>
          ex.name === f.name &&
          ex.size === f.size &&
          ex.lastModified === f.lastModified
      )
  );

  mainFiles.value = [...mainFiles.value, ...newOnes];

  // 같은 파일 다시 선택할 수 있도록 초기화
  if (e.target) {
    e.target.value = "";
  }
}

// ✅ 파일 개별 삭제
function removeMainFile(index) {
  mainFiles.value.splice(index, 1);
}

// 임시 저장 (JSON만)
async function handleTempSave() {
  try {
    const payload = {
      submitCode,
      priority: priority.value,
      mainForm: mainForm.value,
      records: records.value,
    };

    const res = await axios.post("/api/counsel/temp", payload);

    if (res.data?.success) {
      alert("임시 저장이 완료되었습니다.");
    } else {
      alert(res.data.message || "임시 저장 실패");
    }
  } catch (e) {
    console.error(e);
    alert("서버 오류: " + (e.response?.data?.message || e.message));
  }
}

async function handleLoad() {
  try {
    const { data } = await axios.get(`/api/counsel/${submitCode}`);

    if (!data?.success || !data.result) {
      alert(data?.message || "불러올 상담 내용이 없습니다.");
      return;
    }

    const res = data.result;

    if (res.submit_info) {
      submitInfo.value = res.submit_info;
    }

    mainForm.value = {
      counselDate: res.main?.counsel_date || "",
      title: res.main?.title || "",
      content: res.main?.content || "",
    };

    priority.value = res.priority || "계획";

    records.value =
      (res.details || []).map((d, idx) => ({
        id: d.detail_code || Date.now() + idx,
        counselDate: d.counsel_date || "",
        title: d.title || "",
        content: d.content || "",
      })) || [];

    alert("임시 저장된 내용을 불러왔습니다.");
  } catch (e) {
    console.error(e);
    alert(
      "상담 내용 불러오기 중 오류: " + (e.response?.data?.message || e.message)
    );
  }
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

// ✅ 작성 완료: FormData로 JSON + 파일
async function submitAll() {
  const err = validate();
  if (err) {
    alert(err);
    return;
  }

  try {
    const formJson = {
      submitCode,
      priority: priority.value,
      mainForm: mainForm.value,
      records: records.value,
    };

    const formData = new FormData();
    formData.append("formJson", JSON.stringify(formJson));

    mainFiles.value.forEach((file) => {
      formData.append("mainFiles", file);
    });

    const res = await axios.post("/api/counsel/new", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data?.success) {
      alert("상담 저장 완료!");
      router.push({ name: "counselList" });
    } else {
      alert(res.data.message || "저장 실패");
    }
  } catch (e) {
    console.error(e);
    alert("서버 오류: " + (e.response?.data?.message || e.message));
  }
}
</script>
