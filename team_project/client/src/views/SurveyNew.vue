<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios"; // ✅ 백엔드 연결

const router = useRouter();
const sections = ref([]);
let uid = 1;
const newId = () => uid++;
const isChoiceType = (t) => ["RADIO", "CHECKBOX"].includes(String(t).toUpperCase());

// 섹션
function addSection() {
  sections.value.push({ id: newId(), title: "", desc: "", subsections: [] });
}
function removeSection(i) {
  sections.value.splice(i, 1);
}

// 서브섹션
function addSubsection(i) {
  sections.value[i].subsections.push({ id: newId(), title: "", desc: "", items: [] });
}
function removeSubsection(i, j) {
  sections.value[i].subsections.splice(j, 1);
}

// 질문
function addItem(i, j) {
  sections.value[i].subsections[j].items.push({
    id: newId(),
    type: "TEXT",
    text: "",
    required: false,
    options: [],
  });
}
function removeItem(i, j, k) {
  sections.value[i].subsections[j].items.splice(k, 1);
}

// 타입 변경 시 옵션 초기화
function onChangeType(item) {
  if (isChoiceType(item.type)) {
    if (!Array.isArray(item.options)) item.options = [];
    if (item.options.length === 0)
      item.options.push({ id: newId(), label: "", value: "", order: 1 });
  } else {
    item.options = [];
  }
}

// 옵션 추가/삭제
function addOption(i, j, k) {
  const item = sections.value[i].subsections[j].items[k];
  const nextOrder = (item.options?.length || 0) + 1;
  item.options.push({ id: newId(), label: "", value: "", order: nextOrder });
}
function removeOption(i, j, k, o) {
  const item = sections.value[i].subsections[j].items[k];
  item.options.splice(o, 1);
  item.options.forEach((op, idx) => (op.order = idx + 1));
}

// 저장할 데이터 구조 (백엔드 insertSurvey에 맞춤)
const payload = computed(() => ({
  template: {
    version_no: "2.0",
    status: "ACTIVE",
    created_by: 1,
    created_at: new Date().toISOString().slice(0, 10),
  },
  sections: sections.value.map((sec, sIdx) => ({
    order: sIdx + 1,
    title: sec.title,
    desc: sec.desc,
    subsections: sec.subsections.map((sub, subIdx) => ({
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
              order: op.order ?? k + 1,
            }))
          : null,
      })),
    })),
  })),
}));

// ✅ 저장 함수 (백엔드 연동)
async function saveDraft() {
  try {
    const res = await axios.post("/api/survey/new", payload.value);
    if (res.data?.success) {
      alert("조사지 저장 완료!");
      router.push("/survey");
    } else {
      alert("저장 실패");
    }
  } catch (e) {
    console.error("save error:", e);
    alert("서버 오류: " + (e.response?.data?.message || e.message));
  }
}

function goBack() {
  router.push("/survey");
}
</script>

<template>
  <section class="p-6 max-w-5xl mx-auto">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold">새 조사지 작성</h2>
        <p class="text-sm text-gray-500">항목 → 세부항목 → 질문 → 옵션 순으로 구성해요.</p>
      </div>
      <div class="space-x-2">
        <button class="border px-3 py-2 rounded" @click="goBack">← 목록</button>
        <button class="border px-3 py-2 rounded bg-black text-white" @click="saveDraft">저장</button>
      </div>
    </header>

    <!-- 비어있을 때 -->
    <div v-if="sections.length === 0" class="text-center py-16 border rounded mb-6">
      <div class="text-gray-600 mb-4">아직 항목이 없습니다.</div>
      <button class="border px-4 py-2 rounded bg-black text-white" @click="addSection">+ 항목 추가</button>
    </div>

    <!-- 섹션 -->
    <div v-else class="space-y-6">
      <div v-for="(sec, sIndex) in sections" :key="sec.id" class="border rounded p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">항목 #{{ sIndex + 1 }}</h3>
          <div class="space-x-2">
            <button class="border px-3 py-1 rounded" @click="addSubsection(sIndex)">세부항목 추가</button>
            <button class="border px-3 py-1 rounded" @click="removeSection(sIndex)">-</button>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-sm mb-1">항목 제목</label>
            <input v-model="sec.title" class="border px-3 py-2 rounded w-full" />
          </div>
          <div>
            <label class="block text-sm mb-1">항목 설명</label>
            <input v-model="sec.desc" class="border px-3 py-2 rounded w-full" />
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="(sub, subIndex) in sec.subsections" :key="sub.id" class="border rounded p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium">세부항목 #{{ subIndex + 1 }}</div>
              <div class="space-x-2">
                <button class="border px-3 py-1 rounded" @click="addItem(sIndex, subIndex)">질문 추가</button>
                <button class="border px-3 py-1 rounded" @click="removeSubsection(sIndex, subIndex)">-</button>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-sm mb-1">세부항목 제목</label>
                <input v-model="sub.title" class="border px-3 py-2 rounded w-full" />
              </div>
              <div>
                <label class="block text-sm mb-1">세부항목 설명</label>
                <input v-model="sub.desc" class="border px-3 py-2 rounded w-full" />
              </div>
            </div>

            <!-- 질문 -->
            <div class="space-y-3">
              <div v-for="(it, iIndex) in sub.items" :key="it.id" class="border rounded p-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="font-medium">질문 #{{ iIndex + 1 }}</div>
                  <button class="border px-3 py-1 rounded" @click="removeItem(sIndex, subIndex, iIndex)">-</button>
                </div>

                <div class="grid md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-sm mb-1">질문 타입</label>
                    <select v-model="it.type" class="border px-3 py-2 rounded w-full" @change="onChangeType(it)">
                      <option value="TEXT">TEXT (단답)</option>
                      <option value="TEXTAREA">TEXTAREA (서술)</option>
                      <option value="RADIO">RADIO (단일)</option>
                      <option value="CHECKBOX">CHECKBOX (다중)</option>
                    </select>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm mb-1">질문 내용</label>
                    <input v-model="it.text" class="border px-3 py-2 rounded w-full" placeholder="예: 성별을 선택하세요" />
                  </div>
                </div>

                <div class="mt-2">
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" v-model="it.required" />
                    필수 여부
                  </label>
                </div>

                <!-- 옵션 -->
                <div v-if="isChoiceType(it.type)" class="mt-4 border-t pt-3">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium">옵션 ({{ it.options.length }})</div>
                    <button class="border px-3 py-1 rounded" @click="addOption(sIndex, subIndex, iIndex)">+ 옵션 추가</button>
                  </div>

                  <div class="space-y-2">
                    <div v-for="(op, oIndex) in it.options" :key="op.id" class="grid md:grid-cols-12 gap-2 items-center">
                      <div class="md:col-span-1 text-xs text-gray-500">#{{ oIndex + 1 }}</div>
                      <div class="md:col-span-4">
                        <input v-model="op.label" class="border px-3 py-2 rounded w-full" placeholder="라벨 (예: 남자)" />
                      </div>
                      <div class="md:col-span-6">
                        <input v-model="op.value" class="border px-3 py-2 rounded w-full" placeholder="값 (예: M)" />
                      </div>
                      <div class="md:col-span-1 text-right">
                        <button class="border px-3 py-2 rounded" @click="removeOption(sIndex, subIndex, iIndex, oIndex)">-</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- // 질문 -->
          </div>
        </div>
      </div>

      <!-- 하단 컨트롤 -->
      <div class="flex items-center justify-between">
        <button class="border px-4 py-2 rounded" @click="addSection">+ 항목 추가</button>
        <button class="border px-4 py-2 rounded bg-black text-white" @click="saveDraft">저장</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  color: #111;
}
</style>
