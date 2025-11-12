<template>
  <section class="p-6 max-w-5xl mx-auto">
    <header class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold">제출본 수정</h2>
        <p class="text-gray-500 text-sm">
          제출번호 {{ submitCode }} • 템플릿 {{ data?.template_code }} ({{
            data?.version_no
          }}
          / {{ data?.version_detail_no }})
        </p>
      </div>
      <button class="border px-3 py-2 rounded" @click="goBack">← 상세로</button>
    </header>

    <div v-if="loading">불러오는 중...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <!-- 권한 가드 -->
    <div v-else-if="!canEdit" class="text-red-600">
      수정 권한이 없습니다. (작성자: {{ data?.written_by }}, 현재 사용자:
      {{ userId }})
    </div>

    <div v-else>
      <form @submit.prevent="save">
        <div
          v-for="(section, sIdx) in data.sections"
          :key="section.section_code"
          class="border rounded p-4 mb-6"
        >
          <h3 class="text-lg font-semibold mb-2">
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

            <div
              v-for="(item, iIdx) in sub.items"
              :key="item.item_code"
              class="border rounded p-3 mb-3"
            >
              <label class="font-medium block mb-2">
                {{ sIdx + 1 }}.{{ subIdx + 1 }}.{{ iIdx + 1 }}
                {{ item.question_text }}
                <span v-if="item.is_required === 'Y'" class="text-red-500"
                  >*</span
                >
              </label>

              <!-- TEXT -->
              <input
                v-if="isText(item)"
                v-model="answers[item.item_code]"
                type="text"
                class="border px-3 py-2 rounded w-full"
                :placeholder="item.placeholder || ''"
              />

              <!-- TEXTAREA -->
              <textarea
                v-else-if="isTextarea(item)"
                v-model="answers[item.item_code]"
                rows="4"
                class="border px-3 py-2 rounded w-full"
              />

              <!-- RADIO -->
              <div v-else-if="isRadio(item)" class="space-y-1">
                <label
                  v-for="opt in item.option_values"
                  :key="opt.value ?? opt.label"
                  class="flex items-center gap-2"
                >
                  <input
                    type="radio"
                    :name="`r-${item.item_code}`"
                    :value="opt.value ?? opt.label"
                    v-model="answers[item.item_code]"
                  />
                  <span>{{ opt.label ?? opt.value }}</span>
                </label>
              </div>

              <!-- CHECKBOX -->
              <div v-else-if="isCheckbox(item)" class="space-y-1">
                <label
                  v-for="opt in item.option_values"
                  :key="opt.value ?? opt.label"
                  class="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    :value="opt.value ?? opt.label"
                    v-model="answers[item.item_code]"
                  />
                  <span>{{ opt.label ?? opt.value }}</span>
                </label>
              </div>

              <!-- 알 수 없는 타입 대비 -->
              <div v-else class="text-sm text-gray-500">
                지원하지 않는 타입입니다. ({{ item.question_type }})
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="border px-4 py-2 rounded"
            @click="goBack"
          >
            취소
          </button>
          <button
            type="submit"
            class="border px-4 py-2 rounded bg-black text-white"
          >
            수정 완료
          </button>
        </div>
      </form>
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

// 쿼리로 넘어온 현재 사용자/역할 (로그인 없이 테스트용)
const role = computed(() => Number(route.query.role || 1));
const userId = computed(() => Number(route.query.userId || 1));

const data = ref(null);
const loading = ref(false);
const error = ref("");

/** v-model 답변 상태: { [item_code]: string | string[] } */
const answers = ref({});

/** 권한: 일반 사용자 + 본인 작성건 */
const canEdit = computed(() => {
  if (!data.value) return false;
  return role.value === 1 && Number(data.value.written_by) === userId.value;
});

onMounted(async () => {
  await fetchDetail();
  if (data.value) initAnswersFromDetail();
});

// ✅ fetchDetail (응답 포맷 {success, result} / 직접 payload 모두 대응)
async function fetchDetail() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axios.get(`/api/survey/submission/${submitCode}`);

    if (data?.success === false) throw new Error(data.message || "조회 실패");

    const payload = data?.result ?? data;
    data.value = normalizePayload(payload);
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || "조회 실패";
  } finally {
    loading.value = false;
  }
}

function initAnswersFromDetail() {
  const map = {};
  data.value.sections?.forEach((sec) => {
    sec.subsections?.forEach((sub) => {
      sub.items?.forEach((it) => {
        const parsed = parseAnswerText(it.answer_text);
        if (isCheckbox(it)) {
          map[it.item_code] = Array.isArray(parsed)
            ? parsed
            : parsed
            ? [String(parsed)]
            : [];
        } else {
          map[it.item_code] = Array.isArray(parsed)
            ? parsed[0] ?? ""
            : parsed ?? "";
        }
      });
    });
  });
  answers.value = map;
}

function goBack() {
  router.push({
    path: `/survey/submission/${submitCode}`,
    query: { role: role.value, userId: userId.value },
  });
}

// ✅ save (서버 에러 래핑 대응)
async function save() {
  try {
    // 필수 문항 검증 (동일)
    const missing = [];
    data.value.sections?.forEach((sec) => {
      sec.subsections?.forEach((sub) => {
        sub.items?.forEach((it) => {
          if (it.is_required === "Y") {
            const v = answers.value[it.item_code];
            if (isCheckbox(it)) {
              if (!Array.isArray(v) || v.length === 0)
                missing.push(it.question_text);
            } else {
              if (v == null || String(v).trim() === "")
                missing.push(it.question_text);
            }
          }
        });
      });
    });
    if (missing.length) {
      alert(`필수 문항을 입력해주세요:\n- ${missing.join("\n- ")}`);
      return;
    }

    const payload = { answers: answers.value, updated_by: userId.value };
    const { data } = await axios.put(
      `/api/survey/submission/${submitCode}`,
      payload
    );

    if (data?.success === false) throw new Error(data.message || "수정 실패");

    alert("수정 완료!");
    goBack();
  } catch (e) {
    alert(e?.response?.data?.message || e.message || "수정 실패");
  }
}

/* ---------- 타입/유틸 ---------- */
function isRadio(it) {
  return String(it.question_type).toUpperCase() === "RADIO";
}
function isCheckbox(it) {
  return String(it.question_type).toUpperCase() === "CHECKBOX";
}
function isText(it) {
  return String(it.question_type).toUpperCase() === "TEXT";
}
function isTextarea(it) {
  return String(it.question_type).toUpperCase() === "TEXTAREA";
}

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
</script>

<style scoped>
section {
  color: #111;
}
</style>
