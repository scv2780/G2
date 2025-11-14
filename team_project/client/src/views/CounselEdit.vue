<template>
  <section class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- 상단 타이틀 -->
    <header class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-2xl font-semibold">상담서 수정</h2>
        <p class="text-sm text-gray-500">제출 코드: {{ submitCode }}</p>
      </div>

      <div class="space-x-2 flex items-center">
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

        <!-- 🔹 기존 첨부 파일 목록 -->
        <div>
          <span class="block text-sm font-medium mb-1">기존 첨부 파일</span>

          <div v-if="attachments.length">
            <ul class="list-disc pl-4 text-xs text-gray-700 space-y-1">
              <li
                v-for="file in attachments"
                :key="file.attachCode"
                class="flex items-center justify-between gap-2"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <a
                    :href="file.url"
                    target="_blank"
                    class="text-blue-600 hover:underline break-all"
                    :class="{
                      'line-through text-gray-400':
                        removedAttachmentCodes.includes(file.attachCode),
                    }"
                  >
                    {{ file.originalFilename }}
                  </a>
                  <span
                    v-if="removedAttachmentCodes.includes(file.attachCode)"
                    class="text-[11px] text-red-500"
                  >
                    삭제 예정
                  </span>
                </div>

                <button
                  type="button"
                  class="shrink-0 px-2 py-0.5 border rounded text-[11px] text-gray-600 hover:bg-gray-100"
                  @click="toggleRemoveAttachment(file.attachCode)"
                >
                  {{
                    removedAttachmentCodes.includes(file.attachCode)
                      ? "취소"
                      : "삭제"
                  }}
                </button>
              </li>
            </ul>
          </div>
          <div v-else class="text-xs text-gray-400">
            기존에 첨부된 파일이 없습니다.
          </div>
        </div>

        <!-- ✅ 새로 추가할 첨부 파일 -->
        <div>
          <label class="block text-sm mb-1 font-medium">첨부 파일 추가</label>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            @change="onNewFilesChange"
            class="block w-full text-sm"
          />
          <p class="mt-1 text-xs text-gray-500">
            * 여러 개 파일을 한 번에 선택하거나, 나눠서 여러 번 선택할 수
            있습니다.
          </p>

          <!-- 새로 선택한 파일 목록 -->
          <ul
            v-if="newFiles.length"
            class="mt-2 text-xs text-gray-700 space-y-1"
          >
            <li
              v-for="(file, idx) in newFiles"
              :key="file.name + '_' + file.lastModified + '_' + idx"
              class="flex items-center justify-between gap-2"
            >
              <span class="truncate">
                • {{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)
              </span>
              <button
                type="button"
                class="shrink-0 px-2 py-0.5 border rounded text-[11px] text-gray-600 hover:bg-gray-100"
                @click="removeNewFile(idx)"
              >
                삭제
              </button>
            </li>
          </ul>
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
            {{ isResubmit ? "재작성 완료" : "수정 완료" }}
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

const status = ref(""); // 상담 상태 (CB2/CB3/CB4/CB5 ...)

// CB4(반려)인 경우 재작성 모드
const isResubmit = computed(() => status.value === "CB4");

// 기본 정보 / 메인 폼 / 기록 / 우선순위
const submitInfo = ref({
  name: "",
  ssnFront: "",
  submitAt: "",
});

const formattedSubmitAt = computed(() => {
  const v = submitInfo.value.submitAt;
  return v ? v.slice(0, 10) : "-";
});

const mainForm = ref({
  counselDate: "",
  title: "",
  content: "",
});

const records = ref([]);
const priority = ref("계획");

// 🔹 기존 첨부파일 목록
const attachments = ref([]);

// 🔹 삭제 대상 attach_code 목록
const removedAttachmentCodes = ref([]);

// 🔹 새로 추가하는 파일들
const newFiles = ref([]);
const fileInputRef = ref(null);

// 상담 상세 불러오기
async function loadData() {
  loading.value = true;
  error.value = "";
  try {
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
    status.value = res.status || "";

    records.value =
      (res.details || []).map((d, idx) => ({
        id: Date.now() + idx,
        counselDate: d.counsel_date || "",
        title: d.title || "",
        content: d.content || "",
      })) || [];

    attachments.value = res.attachments || [];
  } catch (e) {
    console.error(e);
    error.value = e.message || "상담 정보 조회 중 오류";
  } finally {
    loading.value = false;
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

// ✅ 기존 첨부 삭제 토글
function toggleRemoveAttachment(attachCode) {
  const idx = removedAttachmentCodes.value.indexOf(attachCode);
  if (idx === -1) {
    removedAttachmentCodes.value.push(attachCode);
  } else {
    removedAttachmentCodes.value.splice(idx, 1);
  }
}

// ✅ 새 파일 선택 (누적)
function onNewFilesChange(e) {
  const files = Array.from(e.target.files || []);

  const newOnes = files.filter(
    (f) =>
      !newFiles.value.some(
        (ex) =>
          ex.name === f.name &&
          ex.size === f.size &&
          ex.lastModified === f.lastModified
      )
  );

  newFiles.value = [...newFiles.value, ...newOnes];

  if (e.target) {
    e.target.value = "";
  }
}

// ✅ 새 파일 개별 삭제
function removeNewFile(index) {
  newFiles.value.splice(index, 1);
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

// 저장(수정 완료) → multipart로 전송
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
      removeAttachmentCodes: removedAttachmentCodes.value, // 🔹 삭제할 첨부 목록
    };

    const formData = new FormData();
    formData.append("formJson", JSON.stringify(formJson));

    // 새로 추가된 파일들
    newFiles.value.forEach((file) => {
      formData.append("mainFiles", file);
    });

    const res = await axios.post("/api/counsel/new", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data?.success) {
      if (isResubmit.value) {
        alert("재작성이 완료되었습니다. 승인요청이 다시 올라갔습니다.");
      } else {
        alert("상담 수정이 완료되었습니다.");
      }
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
