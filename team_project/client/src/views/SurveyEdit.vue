<template>
  <section class="p-6 max-w-5xl mx-auto">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold">조사지 수정 (새 버전 생성)</h2>
        <p class="text-sm text-gray-500">
          현재 버전을 복사해서 새로운 세부버전(+0.1)으로 저장합니다.
        </p>
      </div>
      <div class="space-x-2">
        <button class="border px-3 py-2 rounded" @click="goBack">← 목록</button>
        <button
          class="border px-3 py-2 rounded bg-black text-white"
          :disabled="saving"
          @click="saveEdit"
        >
          {{ saving ? "저장 중..." : "수정 저장" }}
        </button>
      </div>
    </header>

    <div v-if="loading">불러오는 중...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div
      v-else-if="sections.length === 0"
      class="text-center py-16 border rounded mb-6"
    >
      <div class="text-gray-600 mb-4">아직 불러올 항목이 없습니다.</div>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="(sec, sIndex) in sections"
        :key="sec.id"
        class="border rounded p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">항목 #{{ sIndex + 1 }}</h3>
          <div class="space-x-2">
            <button
              class="border px-3 py-1 rounded"
              @click="addSubsection(sIndex)"
            >
              세부항목 추가
            </button>
            <button
              class="border px-3 py-1 rounded"
              @click="removeSection(sIndex)"
            >
              -
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-sm mb-1">항목 제목</label>
            <input
              v-model="sec.title"
              class="border px-3 py-2 rounded w-full"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">항목 설명</label>
            <input v-model="sec.desc" class="border px-3 py-2 rounded w-full" />
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="(sub, subIndex) in sec.subsections"
            :key="sub.id"
            class="border rounded p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium">세부항목 #{{ subIndex + 1 }}</div>
              <div class="space-x-2">
                <button
                  class="border px-3 py-1 rounded"
                  @click="addItem(sIndex, subIndex)"
                >
                  질문 추가
                </button>
                <button
                  class="border px-3 py-1 rounded"
                  @click="removeSubsection(sIndex, subIndex)"
                >
                  -
                </button>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-sm mb-1">세부항목 제목</label>
                <input
                  v-model="sub.title"
                  class="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label class="block text-sm mb-1">세부항목 설명</label>
                <input
                  v-model="sub.desc"
                  class="border px-3 py-2 rounded w-full"
                />
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="(it, iIndex) in sub.items"
                :key="it.id"
                class="border rounded p-3"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="font-medium">질문 #{{ iIndex + 1 }}</div>
                  <button
                    class="border px-3 py-1 rounded"
                    @click="removeItem(sIndex, subIndex, iIndex)"
                  >
                    -
                  </button>
                </div>

                <div class="grid md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-sm mb-1">질문 타입</label>
                    <select
                      v-model="it.type"
                      class="border px-3 py-2 rounded w-full"
                      @change="onChangeType(it)"
                    >
                      <option value="TEXT">TEXT (단답)</option>
                      <option value="TEXTAREA">TEXTAREA (서술)</option>
                      <option value="RADIO">RADIO (단일)</option>
                      <option value="CHECKBOX">CHECKBOX (다중)</option>
                    </select>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm mb-1">질문 내용</label>
                    <input
                      v-model="it.text"
                      class="border px-3 py-2 rounded w-full"
                    />
                  </div>
                </div>

                <div class="mt-2">
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" v-model="it.required" /> 필수 여부
                  </label>
                </div>

                <div v-if="isChoiceType(it.type)" class="mt-4 border-t pt-3">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium">
                      옵션 ({{ it.options.length }})
                    </div>
                    <button
                      class="border px-3 py-1 rounded"
                      @click="addOption(sIndex, subIndex, iIndex)"
                    >
                      + 옵션 추가
                    </button>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="(op, oIndex) in it.options"
                      :key="op.id"
                      class="grid md:grid-cols-12 gap-2 items-center"
                    >
                      <div class="md:col-span-1 text-xs text-gray-500">
                        #{{ oIndex + 1 }}
                      </div>
                      <div class="md:col-span-4">
                        <input
                          v-model="op.label"
                          class="border px-3 py-2 rounded w-full"
                          placeholder="라벨"
                        />
                      </div>
                      <div class="md:col-span-6">
                        <input
                          v-model="op.value"
                          class="border px-3 py-2 rounded w-full"
                          placeholder="값"
                        />
                      </div>
                      <div class="md:col-span-1 text-right">
                        <button
                          class="border px-3 py-2 rounded"
                          @click="
                            removeOption(sIndex, subIndex, iIndex, oIndex)
                          "
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /item -->
            </div>
          </div>
          <!-- /subsection -->
        </div>
      </div>
      <!-- /section -->

      <div class="flex items-center justify-between">
        <button class="border px-4 py-2 rounded" @click="addSection">
          + 항목 추가
        </button>
        <button
          class="border px-4 py-2 rounded bg-black text-white"
          :disabled="saving"
          @click="saveEdit"
        >
          {{ saving ? "저장 중..." : "수정 저장" }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();

const templateCode = route.params.id; // /survey/edit/:id
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const sections = ref([]);

// id 생성기
const newId = (() => {
  let id = 1;
  return () => id++;
})();

// 선택형 여부
const isChoiceType = (t) =>
  ["RADIO", "CHECKBOX"].includes(String(t).toUpperCase());

// CRUD helpers
function addSection() {
  sections.value.push({ id: newId(), title: "", desc: "", subsections: [] });
}
function removeSection(i) {
  sections.value.splice(i, 1);
}
function addSubsection(sIdx) {
  sections.value[sIdx].subsections.push({
    id: newId(),
    title: "",
    desc: "",
    items: [],
  });
}
function removeSubsection(sIdx, subIdx) {
  sections.value[sIdx].subsections.splice(subIdx, 1);
}
function addItem(sIdx, subIdx) {
  sections.value[sIdx].subsections[subIdx].items.push({
    id: newId(),
    type: "TEXT",
    text: "",
    required: false,
    options: [],
  });
}
function removeItem(sIdx, subIdx, iIdx) {
  sections.value[sIdx].subsections[subIdx].items.splice(iIdx, 1);
}
function onChangeType(item) {
  if (isChoiceType(item.type)) {
    if (!Array.isArray(item.options)) item.options = [];
    if (item.options.length === 0)
      item.options.push({ id: newId(), label: "", value: "" });
  } else {
    item.options = [];
  }
}
function addOption(sIdx, subIdx, iIdx) {
  sections.value[sIdx].subsections[subIdx].items[iIdx].options.push({
    id: newId(),
    label: "",
    value: "",
  });
}
function removeOption(sIdx, subIdx, iIdx, oIdx) {
  sections.value[sIdx].subsections[subIdx].items[iIdx].options.splice(oIdx, 1);
}

// 데이터 로드 (원본 → 편집용 draft 구조로 매핑)
onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`/api/survey/detail/${templateCode}`);
    const payload = data?.result ?? data; // 통일 응답형식 대응
    const srcSections = payload.sections || [];

    sections.value = srcSections.map((s) => ({
      id: newId(),
      title: s.section_title ?? "",
      desc: s.section_desc ?? "",
      subsections: (s.subsections || []).map((sub) => ({
        id: newId(),
        title: sub.subsection_title ?? "",
        desc: sub.subsection_desc ?? "",
        items: (sub.items || []).map((it) => ({
          id: newId(),
          type: (it.question_type || "TEXT").toUpperCase(),
          text: it.question_text ?? "",
          required: it.is_required === "Y",
          options: (Array.isArray(it.option_values)
            ? it.option_values
            : []
          ).map((op, idx) => ({
            id: newId(),
            label: op.label ?? "",
            value: op.value ?? "",
            order: Number(op.order ?? idx + 1),
          })),
        })),
      })),
    }));
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || "조사지 로드 실패";
  } finally {
    loading.value = false;
  }
});

// 저장(새 버전 생성)
async function saveEdit() {
  if (saving.value) return;
  saving.value = true;
  try {
    const payload = {
      template: {
        created_by: 1,
        created_at: new Date().toISOString().slice(0, 10),
      },
      sections: sections.value.map((s, sIdx) => ({
        order: sIdx + 1,
        title: s.title,
        desc: s.desc,
        subsections: s.subsections.map((sub, subIdx) => ({
          order: subIdx + 1,
          title: sub.title,
          desc: sub.desc,
          items: sub.items.map((it, iIdx) => ({
            order: iIdx + 1,
            question_type: it.type,
            question_text: it.text,
            is_required: it.required ? "Y" : "N",
            option_values: isChoiceType(it.type)
              ? it.options.map((op, k) => ({
                  label: op.label ?? "",
                  value: op.value ?? "",
                  order: Number(op.order ?? k + 1),
                }))
              : null,
          })),
        })),
      })),
    };

    const { data: res } = await axios.post(
      `/api/survey/update/${templateCode}`,
      payload
    );

    // ✅ 서버 통일 응답({ success, result, message }) 체크
    if (!res?.success) {
      throw new Error(res?.message || "저장 실패");
    }

    alert("새 버전으로 저장 완료!");
    router.push({ name: "surveyVersion" });
  } catch (e) {
    console.error("save error:", e);
    alert(e?.response?.data?.message || e.message || "저장 실패");
  } finally {
    saving.value = false;
  }
}

function goBack() {
  router.push({ name: "surveyVersion" });
}
</script>

<style scoped>
section {
  color: #111;
}
</style>
