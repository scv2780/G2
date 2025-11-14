<template>
  <section class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- 상단 타이틀 -->
    <header class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-2xl font-semibold">상담 상세</h2>
        <p class="text-sm text-gray-500">
          제출 코드: {{ submitCode }}
          <span v-if="status" class="ml-2 text-xs px-2 py-0.5 border rounded">
            상태: {{ status }}
          </span>
        </p>
      </div>

      <div class="space-x-2 flex items-center">
        <!-- ← 목록으로 -->
        <MaterialButton color="dark" size="sm" @click="goBack">
          ← 목록으로
        </MaterialButton>

        <!-- BEFORE → 작성하기 (담당자만 / CB1, CB2) -->
        <MaterialButton
          v-if="role === 2 && (status === 'CB1' || status === 'CB2')"
          color="dark"
          size="sm"
          @click="goWrite"
        >
          작성하기
        </MaterialButton>

        <!-- REQ → 수정하기 (담당자만 / CB3) -->
        <MaterialButton
          v-else-if="role === 2 && status === 'CB3'"
          color="dark"
          size="sm"
          @click="goEdit"
        >
          수정하기
        </MaterialButton>

        <!-- 🔥 CB4 → 재수정하기 (반려 시 담당자 전용) -->
        <MaterialButton
          v-else-if="role === 2 && status === 'CB4'"
          color="dark"
          size="sm"
          @click="goEdit"
        >
          재수정하기
        </MaterialButton>
      </div>
    </header>

    <!-- 로딩/에러 -->
    <div v-if="loading" class="text-sm text-gray-500">불러오는 중...</div>
    <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

    <!-- 본문 -->
    <template v-else>
      <!-- 기본정보 (상태와 관계없이 항상 표시) -->
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

          <div class="flex items-center gap-2">
            <span class="text-gray-500">우선순위:</span>
            <span class="font-semibold">{{ priority }}</span>
          </div>
        </div>
      </div>

      <!-- ✅ CB1 / CB2 일 때: 내용 숨기고 안내만 -->
      <div
        v-if="status === 'CB1' || status === 'CB2'"
        class="text-sm text-gray-500 mt-4"
      >
        <template v-if="status === 'CB1'">
          이 상담은 <strong>임시 저장</strong> 상태입니다.<br />
          작성 중인 상담 내용은
          <span class="font-semibold">[작성하기]</span> 화면에서만 확인·수정할
          수 있습니다.
        </template>

        <template v-else>
          이 상담은 아직 <strong>작성 전</strong> 상태입니다.<br />
          상담 내용은
          <span class="font-semibold">[작성하기]</span> 버튼을 눌러 작성해
          주세요.
        </template>
      </div>

      <!-- ✅ CB1/CB2 가 아닐 때: 실제 상담 내용 / 기록 / 승인/반려 노출 -->
      <template v-else>
        <!-- 메인 상담 -->
        <div class="border rounded p-4 bg-white space-y-3">
          <h3 class="font-semibold text-lg">주요 상담</h3>

          <div class="text-sm text-gray-600">
            상담일:
            <span class="font-medium">{{ mainForm.counselDate }}</span>
          </div>

          <div>
            <div class="text-sm text-gray-500 mb-1">상담 제목</div>
            <div class="border rounded px-3 py-2 bg-gray-50">
              {{ mainForm.title || "-" }}
            </div>
          </div>

          <div>
            <div class="text-sm text-gray-500 mb-1">상담 내용</div>
            <div
              class="border rounded px-3 py-2 bg-gray-50 whitespace-pre-line"
            >
              {{ mainForm.content || "-" }}
            </div>
          </div>

          <!-- 🔹 첨부 파일 영역 -->
          <div class="mt-3">
            <div class="text-sm text-gray-500 mb-1">첨부 파일</div>

            <div v-if="attachments.length">
              <ul class="list-disc pl-4 text-sm">
                <li
                  v-for="file in attachments"
                  :key="file.attachCode"
                  class="text-blue-600"
                >
                  <a
                    :href="file.url"
                    target="_blank"
                    class="hover:underline break-all"
                  >
                    {{ file.originalFilename }}
                  </a>
                </li>
              </ul>
            </div>
            <div v-else class="text-xs text-gray-400">
              첨부된 파일이 없습니다.
            </div>
          </div>
        </div>

        <!-- 추가 상담 기록 -->
        <div v-if="records.length" class="space-y-4">
          <h3 class="font-semibold text-lg">추가 상담 기록</h3>

          <div
            v-for="(record, idx) in records"
            :key="record.id || idx"
            class="border rounded p-4 bg-white space-y-3"
          >
            <div class="flex justify-between items-center text-sm">
              <div class="font-medium">기록 #{{ idx + 1 }}</div>
              <div class="text-gray-500">
                상담일:
                <span class="font-medium">{{ record.counselDate }}</span>
              </div>
            </div>

            <div>
              <div class="text-sm text-gray-500 mb-1">상담 제목</div>
              <div class="border rounded px-3 py-2 bg-gray-50">
                {{ record.title || "-" }}
              </div>
            </div>

            <div>
              <div class="text-sm text-gray-500 mb-1">상담 내용</div>
              <div
                class="border rounded px-3 py-2 bg-gray-50 whitespace-pre-line"
              >
                {{ record.content || "-" }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-sm text-gray-500">
          추가 상담 기록이 없습니다.
        </div>

        <!-- 🔥 관리자(3) 전용 승인/반려 버튼 영역 -->
        <div
          v-if="role === 3 && (status === 'CB3' || status === 'CB6')"
          class="flex justify-end gap-3 pt-4 border-t mt-4"
        >
          <MaterialButton color="dark" size="sm" @click="handleApprove">
            승인
          </MaterialButton>
          <MaterialButton color="dark" size="sm" @click="handleReject">
            반려
          </MaterialButton>
        </div>
      </template>
    </template>

    <!-- 🔻 반려 사유 입력 모달 -->
    <div v-if="rejectModalOpen" class="modal-overlay">
      <div class="modal-container">
        <h3 class="text-lg font-semibold mb-3">반려 사유 입력</h3>

        <MaterialTextarea
          id="reject-reason"
          variant="outline"
          :rows="4"
          placeholder="반려 사유를 입력하세요..."
          :value="rejectReason"
          @input="(e) => (rejectReason = e.target.value)"
        />

        <div class="modal-actions">
          <MaterialButton color="dark" size="sm" @click="closeRejectModal">
            취소
          </MaterialButton>
          <MaterialButton color="dark" size="sm" @click="confirmReject">
            반려
          </MaterialButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import MaterialButton from "@/components/MaterialButton.vue";
import MaterialTextarea from "@/components/MaterialTextarea.vue";

const route = useRoute();
const router = useRouter();
const submitCode = Number(route.params.submitCode);

const loading = ref(false);
const error = ref("");
const attachments = ref([]); // 🔹 첨부파일 목록

// 쿼리로 넘어온 role (2: 담당자, 3: 관리자, 4: 시스템)
const role = computed(() => Number(route.query.role || 0));

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
const status = ref("");

// 데이터 로딩
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
        id: d.detail_code || Date.now() + idx,
        counselDate: d.counsel_date || "",
        title: d.title || "",
        content: d.content || "",
      })) || [];

    // 🔹 첨부파일 세팅
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
function goEdit() {
  router.push({ name: "counsel-edit", params: { submitCode } });
}
function goWrite() {
  router.push({ name: "counsel-new", params: { submitCode } });
}

const rejectModalOpen = ref(false);
const rejectReason = ref("");

// 승인
async function handleApprove() {
  try {
    const { data } = await axios.post(`/api/counsel/${submitCode}/approve`);
    if (data?.success) {
      alert("승인되었습니다.");
      await loadData(); // 다시 조회
    } else {
      alert(data.message || "승인 처리 실패");
    }
  } catch (e) {
    console.error(e);
    alert("서버 오류: " + (e.response?.data?.message || e.message));
  }
}

// 반려 버튼 눌렀을 때 → 모달 열기
function handleReject() {
  rejectReason.value = "";
  rejectModalOpen.value = true;
}

// 모달 안에서 '반려' 확정
async function confirmReject() {
  if (!rejectReason.value.trim()) {
    alert("반려 사유를 입력해주세요.");
    return;
  }

  try {
    const { data } = await axios.post(`/api/counsel/${submitCode}/reject`, {
      reason: rejectReason.value,
    });
    if (data?.success) {
      alert("반려되었습니다.");
      rejectModalOpen.value = false;
      await loadData();
    } else {
      alert(data.message || "반려 처리 실패");
    }
  } catch (e) {
    console.error(e);
    alert("서버 오류: " + (e.response?.data?.message || e.message));
  }
}

function closeRejectModal() {
  rejectModalOpen.value = false;
}

loadData();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0; /* top:0; right:0; bottom:0; left:0; */
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; /* 다른 요소들 위로 */
}

.modal-container {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.35);
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
