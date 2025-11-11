<!-- views/SurveyNew.vue -->
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

// 작성 메타 (원하면 화면에서 입력 가능하도록 확장)
const meta = ref({
  status: "ACTIVE",
  created_by: 1, // 로그인 연동 시 교체
  created_at: new Date().toISOString().slice(0, 10),
});

// 데이터 구조: 섹션 → 서브섹션 → 질문
const sections = ref([]);
// 섹션: { title, desc, order, subsections: [...] }
// 서브섹션: { title, desc, order, items: [...] }
// 아이템: { type, text, required, order }

function addSection() {
  sections.value.push({
    title: "",
    desc: "",
    order: sections.value.length + 1,
    subsections: [],
  });
}
function removeSection(idx) {
  sections.value.splice(idx, 1);
  sections.value.forEach((s, i) => (s.order = i + 1));
}

function addSubsection() {
  if (!sections.value.length) {
    addSection();
  }
  const s = sections.value[sections.value.length - 1];
  s.subsections.push({
    title: "",
    desc: "",
    order: s.subsections.length + 1,
    items: [],
  });
}
function removeSubsection(sIdx, ssIdx) {
  sections.value[sIdx].subsections.splice(ssIdx, 1);
  sections.value[sIdx].subsections.forEach((ss, i) => (ss.order = i + 1));
}

function addItem() {
  if (!sections.value.length) addSection();
  const s = sections.value[sections.value.length - 1];
  if (!s.subsections.length) addSubsection();
  const ss = s.subsections[s.subsections.length - 1];
  ss.items.push({
    type: "TEXT", // TEXT | RADIO | CHECKBOX 등
    text: "",
    required: "N",
    order: ss.items.length + 1,
  });
}
function removeItem(sIdx, ssIdx, iIdx) {
  sections.value[sIdx].subsections[ssIdx].items.splice(iIdx, 1);
  sections.value[sIdx].subsections[ssIdx].items.forEach(
    (it, i) => (it.order = i + 1)
  );
}

const saving = ref(false);
async function submitAll() {
  // 간단 유효성
  if (!sections.value.length)
    return alert("최소 1개 이상의 항목(섹션)을 추가하세요.");

  const payload = {
    // 버전 생성 지시 (백엔드에서 자동으로 2.0 계산 or 고정)
    version_no: "2.0", // 요구: 새 템플릿 버전 2.0
    version_detail_no: "2.0.0", // 세부 버전 (원하면 규칙 변경)
    status: meta.value.status,
    created_by: meta.value.created_by,
    created_at: meta.value.created_at,
    structure: sections.value, // 섹션/서브섹션/질문 전체 구조
  };

  try {
    saving.value = true;
    await axios.post("/api/survey/new-version", payload);
    router.push("/survey");
  } catch (e) {
    alert(e?.response?.data?.message || e.message || "저장 중 오류");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="p-6">
    <h2 class="text-2xl font-semibold mb-3">새 조사지 작성 (버전 2.0)</h2>

    <!-- 상단 제어 버튼 -->
    <div class="mb-4 flex gap-2">
      <button class="btn" @click="addSection">항목추가</button>
      <button class="btn" @click="addSubsection">세부항목추가</button>
      <button class="btn" @click="addItem">질문추가</button>
    </div>

    <!-- 동적 폼 -->
    <div v-for="(s, sIdx) in sections" :key="sIdx" class="blk">
      <div class="row">
        <b>섹션 {{ s.order }}</b>
        <button class="minus" @click="removeSection(sIdx)">-</button>
      </div>
      <div class="grid2">
        <label
          >제목 <input v-model="s.title" class="inp" placeholder="섹션 제목"
        /></label>
        <label
          >설명 <input v-model="s.desc" class="inp" placeholder="섹션 설명"
        /></label>
      </div>

      <div v-for="(ss, ssIdx) in s.subsections" :key="ssIdx" class="blk2">
        <div class="row">
          <span>세부항목 {{ ss.order }}</span>
          <button class="minus" @click="removeSubsection(sIdx, ssIdx)">
            -
          </button>
        </div>
        <div class="grid2">
          <label
            >제목
            <input v-model="ss.title" class="inp" placeholder="세부항목 제목"
          /></label>
          <label
            >설명
            <input v-model="ss.desc" class="inp" placeholder="세부항목 설명"
          /></label>
        </div>

        <div v-for="(it, iIdx) in ss.items" :key="iIdx" class="blk3">
          <div class="row">
            <span>질문 {{ it.order }}</span>
            <button class="minus" @click="removeItem(sIdx, ssIdx, iIdx)">
              -
            </button>
          </div>
          <div class="grid3">
            <label
              >유형
              <select v-model="it.type" class="inp">
                <option>TEXT</option>
                <option>RADIO</option>
                <option>CHECKBOX</option>
                <option>TEXTAREA</option>
              </select>
            </label>
            <label
              >필수
              <select v-model="it.required" class="inp">
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </label>
            <label class="colspan2"
              >질문문구
              <input
                v-model="it.text"
                class="inp"
                placeholder="질문을 입력하세요"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 text-right">
      <router-link to="/survey" class="btn ghost">취소</router-link>
      <button class="btn" :disabled="saving" @click="submitAll">
        {{ saving ? "저장 중…" : "작성완료" }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.btn {
  border: 1px solid #222;
  background: #222;
  color: #fff;
  padding: 8px 14px;
  border-radius: 10px;
}
.btn.ghost {
  background: #fff;
  color: #222;
}
.minus {
  border: 1px solid #999;
  background: #fff;
  color: #222;
  padding: 2px 8px;
  border-radius: 8px;
}
.blk {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}
.blk2 {
  border: 1px dashed #ccc;
  border-radius: 10px;
  padding: 10px;
  margin: 10px 0 0 0;
}
.blk3 {
  border: 1px dashed #e0e0e0;
  border-radius: 10px;
  padding: 10px;
  margin: 8px 0 0 0;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 8px;
}
.grid3 {
  display: grid;
  grid-template-columns: 180px 180px 1fr;
  gap: 10px;
}
.colspan2 {
  grid-column: 1 / span 3;
}
.inp {
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 8px;
  width: 100%;
}
</style>
