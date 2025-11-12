<template>
  <section class="p-6 max-w-5xl mx-auto relative">
    <!-- 관리자 전용: 우상단 담당자 배정 버튼 -->
    <div v-if="isAdmin" class="absolute right-6 top-6">
      <button
        class="border px-3 py-2 rounded bg-gray-900 text-white"
        @click="goAssignPage"
      >
        담당자 배정
      </button>
    </div>

    <header class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-semibold">조사지 답변 상세</h2>
        <p class="text-gray-500 text-sm">
          제출번호 {{ submitCode }} • 상태:
          <span class="font-medium">{{ data?.status ?? "-" }}</span>
        </p>
      </div>
      <button @click="goBack" class="border px-3 py-2 rounded">
        ← 목록으로
      </button>
    </header>

    <!-- 로딩/에러 -->
    <div v-if="loading" class="text-gray-500">불러오는 중...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="!data" class="text-gray-500">데이터가 없습니다.</div>

    <!-- 본문 -->
    <div v-else>
      <div class="mb-5 text-sm text-gray-700">
        <div class="mb-1">
          <span class="font-medium">템플릿 코드:</span> {{ data.template_code }}
        </div>
        <div class="mb-1">
          <span class="font-medium">버전:</span> {{ data.version_no }} /
          {{ data.version_detail_no }}
        </div>
        <div class="mb-1">
          <span class="font-medium">제출일:</span> {{ fmt(data.submit_at) }}
          <span class="mx-2 text-gray-400">|</span>
          <span class="font-medium">수정일:</span> {{ fmt(data.updated_at) }}
        </div>
        <div class="mb-1">
          <span class="font-medium">작성자:</span> {{ data.written_by ?? "-" }}
          <span class="mx-2 text-gray-400">|</span>
          <span class="font-medium">담당자:</span> {{ data.assi_by ?? "-" }}
        </div>
      </div>

      <!-- 섹션/서브섹션/문항 -->
      <div
        v-for="(section, sIdx) in data.sections"
        :key="section.section_code"
        class="border rounded p-4 mb-6"
      >
        <h3 class="text-lg font-semibold mb-1">
          {{ sIdx + 1 }}. {{ section.section_title }}
        </h3>
        <p v-if="section.section_desc" class="text-gray-600 mb-3">
          {{ section.section_desc }}
        </p>

        <div
          v-for="(sub, subIdx) in section.subsections"
          :key="sub.subsection_code"
          class="border-t pt-3 mt-3"
        >
          <h4 class="font-medium mb-2">
            {{ sIdx + 1 }}.{{ subIdx + 1 }} {{ sub.subsection_title }}
          </h4>
          <p v-if="sub.subsection_desc" class="text-gray-600 mb-3">
            {{ sub.subsection_desc }}
          </p>

          <ul class="space-y-3">
            <li
              v-for="(item, iIdx) in sub.items"
              :key="item.item_code"
              class="border p-3 rounded"
            >
              <div class="font-medium mb-1">
                {{ sIdx + 1 }}.{{ subIdx + 1 }}.{{ iIdx + 1 }}
                {{ item.question_text }}
                <span v-if="item.is_required === 'Y'" class="text-red-500"
                  >*</span
                >
              </div>

              <div class="text-sm text-gray-700">
                <span class="inline-block w-12 text-gray-500">유형</span> :
                {{ item.question_type }}
              </div>

              <div class="mt-1">
                <span class="inline-block w-12 text-gray-500 text-sm"
                  >답변</span
                >
                :
                <template v-if="Array.isArray(renderAnswer(item))">
                  <span class="text-gray-900">{{
                    renderAnswer(item).join(", ") || "-"
                  }}</span>
                </template>
                <template v-else>
                  <span class="text-gray-900">{{
                    renderAnswer(item) || "-"
                  }}</span>
                </template>
              </div>

              <div
                v-if="
                  isChoiceType(item.question_type) && item.option_values?.length
                "
                class="mt-2 text-xs text-gray-500"
              >
                (선택지:
                {{
                  item.option_values.map((o) => o.label ?? o.value).join(", ")
                }})
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- 일반 전용: 우하단 수정 버튼 -->
      <button
        v-if="isGeneral"
        class="fixed right-6 bottom-6 shadow-lg border px-4 py-3 rounded-full bg-black text-white"
        @click="goEdit"
      >
        수정하기
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const submitCode = route.params.submitCode;

// 쿼리로 전달된 역할/유저 (없으면 기본값)
const role = computed(() => Number(route.query.role || 1));
const userId = computed(() => Number(route.query.userId || 1));

// 권한 플래그
const isGeneral = computed(() => role.value === 1);
const isAdmin = computed(() => role.value === 3);

const data = ref(null);
const loading = ref(false);
const error = ref("");

onMounted(fetchDetail);

async function fetchDetail() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axios.get(`/api/survey/submission/${submitCode}`);

    // ✅ 에러 래핑 대응
    if (data?.success === false) throw new Error(data.message || "조회 실패");

    // ✅ {success,result} / 직접 payload 둘 다 대응
    const payload = data?.result ?? data;

    data.value = normalizePayload(payload);
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || "조회 실패";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push("/survey-list");
}

// ✅ 관리자: 담당자 배정 페이지로 이동 (쿼리 유지)
function goAssignPage() {
  router.push({
    path: `/assign-manager/${submitCode}`,
    query: { role: role.value, userId: userId.value },
  });
}

// ✅ 일반: 제출본 수정 페이지로 이동 (쿼리 유지)
function goEdit() {
  router.push({
    path: `/survey/submission/${submitCode}/edit`,
    query: { role: role.value, userId: userId.value },
  });
}

/* ---------- 렌더/정규화 유틸 ---------- */
const CHOICE_TYPES = ["RADIO", "CHECKBOX"];
function isChoiceType(t) {
  return CHOICE_TYPES.includes(String(t).toUpperCase());
}

// 옵션 value → label 매핑
function mapValueToLabel(value, options = []) {
  const byValue = options.find((o) => (o?.value ?? o?.label) === value);
  if (byValue) return byValue.label ?? byValue.value ?? value;
  const byLabel = options.find((o) => o?.label === value);
  return byLabel ? byLabel.label ?? value : value;
}

// answer_text 정규화 (문자열/JSON/배열 모두 처리)
function parseAnswerText(answer_text) {
  if (answer_text == null) return null;
  if (Array.isArray(answer_text)) return answer_text;
  if (typeof answer_text === "object") return answer_text;
  if (typeof answer_text === "string") {
    const s = answer_text.trim();
    if (!s) return "";
    if (
      (s.startsWith("[") && s.endsWith("]")) ||
      (s.startsWith("{") && s.endsWith("}"))
    ) {
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    }
    return s;
  }
  return String(answer_text);
}

// 뷰 표시용 최종 답변
function renderAnswer(item) {
  const options = Array.isArray(item.option_values) ? item.option_values : [];
  const raw = parseAnswerText(item.answer_text);

  if (isChoiceType(item.question_type)) {
    if (Array.isArray(raw)) return raw.map((v) => mapValueToLabel(v, options));
    if (raw == null || raw === "") return "";
    return mapValueToLabel(raw, options);
  }
  // TEXT/TEXTAREA
  if (Array.isArray(raw)) return raw.join(", ");
  return raw ?? "";
}

// 서버에서 option_values가 문자열일 수도 있으니 배열로 보정
function normalizeOptions(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    try {
      return JSON.parse(s);
    } catch {
      return [];
    }
  }
  return [];
}

// 전체 payload 정규화
function normalizePayload(payload) {
  if (!payload) return payload;
  const copy = JSON.parse(JSON.stringify(payload));
  copy.sections?.forEach((sec) => {
    sec.subsections?.forEach((sub) => {
      sub.items?.forEach((it) => {
        it.option_values = normalizeOptions(it.option_values);
      });
    });
  });
  return copy;
}

function fmt(v) {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d) ? String(v) : d.toISOString().slice(0, 10);
}
</script>

<style scoped>
section {
  color: #111;
}
</style>
