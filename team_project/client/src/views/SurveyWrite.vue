<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const survey = ref(null);
const answers = ref({});

onMounted(async () => {
  try {
    const { data } = await axios.get("/api/survey/latest");
    const payload = data?.result ?? data; // ✅ 통일/비통일 응답 모두 대응
    survey.value = payload;

    // ✅ 초기화: 체크박스는 배열, 나머지는 빈 문자열
    for (const section of payload?.sections ?? []) {
      for (const sub of section.subsections ?? []) {
        for (const item of sub.items ?? []) {
          answers.value[item.item_code] =
            String(item.question_type).toUpperCase() === "CHECKBOX" ? [] : "";
        }
      }
    }
  } catch (e) {
    alert("조사지 불러오기 실패: " + (e.response?.data?.message || e.message));
  }
});

async function submitSurvey() {
  try {
    const res = await axios.post("/api/survey/submit", {
      template_ver_code: survey.value.template_ver_code,
      answers: answers.value,
    });

    if (res.data?.success !== false) {
      alert("응답이 저장되었습니다!");
      router.push("/survey-list");
    } else {
      alert("저장 실패: " + (res.data?.message || "알 수 없는 오류"));
    }
  } catch (e) {
    alert("저장 실패: " + (e.response?.data?.message || e.message));
  }
}

function goBack() {
  router.push("/survey-list");
}
</script>

<template>
  <section class="p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">조사지 작성</h2>

    <div v-if="!survey">불러오는 중...</div>

    <div v-else>
      <div
        v-for="section in survey.sections"
        :key="section.section_code"
        class="mb-6 border p-4 rounded"
      >
        <h3 class="text-xl font-semibold mb-2">{{ section.section_title }}</h3>

        <div
          v-for="sub in section.subsections"
          :key="sub.subsection_code"
          class="mb-4 pl-4 border-l"
        >
          <h4 class="font-medium mb-2">{{ sub.subsection_title }}</h4>

          <div v-for="item in sub.items" :key="item.item_code" class="mb-3">
            <label class="block font-medium mb-1">{{
              item.question_text
            }}</label>

            <input
              v-if="item.question_type === 'TEXT'"
              v-model="answers[item.item_code]"
              class="border px-3 py-2 rounded w-full"
              placeholder="답변을 입력하세요"
            />
            <textarea
              v-else-if="item.question_type === 'TEXTAREA'"
              v-model="answers[item.item_code]"
              class="border px-3 py-2 rounded w-full"
              placeholder="내용을 입력하세요"
            ></textarea>

            <!-- RADIO -->
            <div v-else-if="item.question_type === 'RADIO'" class="space-y-1">
              <label
                v-for="opt in item.option_values"
                :key="opt.value"
                class="flex items-center gap-2"
              >
                <input
                  type="radio"
                  :name="'item_' + item.item_code"
                  :value="opt.value"
                  v-model="answers[item.item_code]"
                />
                <span>{{ opt.label }}</span>
              </label>
            </div>

            <!-- CHECKBOX (v-model = array) -->
            <div
              v-else-if="item.question_type === 'CHECKBOX'"
              class="space-y-1"
            >
              <label
                v-for="opt in item.option_values"
                :key="opt.value"
                class="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  :value="opt.value"
                  v-model="answers[item.item_code]"
                />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="text-right mt-6">
        <button class="border px-3 py-2 rounded" @click="goBack">← 목록</button>
        <button
          @click="submitSurvey"
          class="border px-4 py-2 rounded bg-black text-white"
        >
          제출하기
        </button>
      </div>
    </div>
  </section>
</template>
