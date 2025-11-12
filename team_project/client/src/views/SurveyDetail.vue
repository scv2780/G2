<template>
  <section class="p-6 max-w-5xl mx-auto">
    <header class="mb-4 flex justify-between items-center">
      <h2 class="text-2xl font-semibold">조사지 상세보기</h2>
      <button @click="goBack" class="border px-3 py-2 rounded">
        ← 목록으로
      </button>
    </header>

    <div v-if="loading">불러오는 중...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="!survey">조사지를 찾을 수 없습니다.</div>

    <div v-else>
      <h3 class="text-xl font-medium mb-2">
        템플릿 코드: {{ survey.template_code }}
      </h3>
      <p class="text-gray-600 mb-2">메이저 버전: {{ survey.version_no }}</p>
      <p class="text-gray-600 mb-6">세부 버전: {{ survey.version_detail_no }}</p>

      <div
        v-for="(section, sIdx) in survey.sections"
        :key="section.section_code"
        class="mb-8 border rounded p-4"
      >
        <h4 class="font-semibold text-lg mb-2">
          {{ sIdx + 1 }}. {{ section.section_title }}
        </h4>
        <p class="text-gray-600 mb-3">{{ section.section_desc }}</p>

        <div
          v-for="(sub, subIdx) in section.subsections"
          :key="sub.subsection_code"
          class="border-t pt-3 mt-3"
        >
          <h5 class="font-semibold mb-2">
            {{ sIdx + 1 }}.{{ subIdx + 1 }} {{ sub.subsection_title }}
          </h5>
          <p class="text-gray-600 mb-3">{{ sub.subsection_desc }}</p>

          <ul class="space-y-3">
            <li
              v-for="(item, iIdx) in sub.items"
              :key="item.item_code"
              class="border p-3 rounded"
            >
              <div class="font-medium mb-1">
                {{ sIdx + 1 }}.{{ subIdx + 1 }}.{{ iIdx + 1 }}
                {{ item.question_text }}
                <span v-if="item.is_required === 'Y'" class="text-red-500">*</span>
              </div>
              <div class="text-sm text-gray-500">
                유형: {{ item.question_type }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <button
        class="border px-4 py-2 rounded bg-gray-900 text-white"
        @click="goEdit()"
      >
        수정하기
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const templateVerCode = computed(() => route.params.templateVerCode);
const data = ref(null);
const survey = computed(() => data.value);   // ★ 템플릿에서 쓰는 별칭
const loading = ref(false);
const error = ref(null);

async function fetchDetail() {
  loading.value = true;
  error.value = null;
  try {
    if (!templateVerCode.value) {
      throw new Error("세부버전 코드가 없습니다.");
    }
    const res = await axios.get(`/api/survey/detail/ver/${templateVerCode.value}`);
    data.value = res.data?.result || null;
    // console.log("detail", data.value);
  } catch (e) {
    error.value = e?.message || "상세 조회 중 오류";
    data.value = null;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: "surveyVersion" });
}

function goEdit() {
  if (!survey.value) return;
  // edit 화면은 ver코드로 로딩 → id 자리에 template_ver_code를 넣어줌
  router.push({ name: "survey-edit", params: { id: survey.value.template_ver_code } });
}

onMounted(fetchDetail);
watch(templateVerCode, fetchDetail);
</script>
