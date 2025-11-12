<template>
  <div class="p-6">
    <div id="container">
      <h2 class="text-xl font-bold mb-2">후원 프로그램 등록</h2>
      <hr />
      <label for="program_name">프로그램 명</label>
      <input
        type="text"
        id="program_name"
        name="program_name"
        v-model="formData.program_name"
      />
      <label for="program_type">후원유형</label>
      <select
        id="program_type"
        name="program_type"
        v-model="formData.sponsor_type"
      >
        <option value="단기">단기</option>
        <option value="정기" disabled>정기</option>
      </select>
      <label for="program_status">상태</label>
      <select
        id="program_status"
        name="program_status"
        v-model="formData.status"
      >
        <option value="집행전">진행전</option>
        <option value="집행 중" disabled>진행중</option>
        <option value="집행 완료" disabled>진행완료</option>
      </select>
      <label for="amount_setting">금액 단위 설정</label>
      <div class="field-container checkbox-group">
        지정
        <input
          type="radio"
          name="unit"
          id="amount_fixed"
          value="지정"
          v-model="amountSettingType"
        />
        자율
        <input
          type="radio"
          name="unit"
          id="amount_free"
          value="자율"
          v-model="amountSettingType"
        />
        <button type="button" class="add-button" @click="addUnitInput">
          단위 추가 +
        </button>
      </div>
      <template v-for="unit in amountUnits" :key="unit.id">
        <label :for="`unit-${unit.id}`"></label>
        <div class="field-container dynamic-unit-input">
          <input
            type="text"
            inputmode="numeric"
            :id="`unit-${unit.id}`"
            :value="numberFormat(unit.value)"
            @input="formatUnitInput(unit, $event)"
            placeholder="금액 단위를 입력하세요 (예: 10,000)"
          />
          <button
            type="button"
            class="remove-button"
            @click="removeUnitInput(unit.id)"
            v-if="amountUnits.length >= 0"
          >
            삭제
          </button>
        </div>
      </template>
      <label for="amout">목표 금액</label>
      <input
        type="text"
        id="amout"
        name="amout"
        v-model="formattedGoalAmount"
        inputmode="numeric"
      />
      <label for="">승인</label>
      <select v-model="formData.approval_status">
        <option value="승인전">승인전</option>
        <option value="승인요청" disabled>승인 요청</option>
        <option value="심사중" disabled>심사중</option>
        <option value="승인 완료" disabled>승인 완료</option>
      </select>
      첨부파일 <input type="file" />
      <div class="button-group-footer">
        <button class="primary-button" v-on:click="programAdd()">등록</button>
        <button class="secondary-button" v-on:click="goList()">닫기</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import numberFormat from "@/utils/numberFormat";
const emit = defineEmits(["goToList"]);

// 폼 데이터를 관리할 반응형 객체 (ref) 정의
const formData = ref({
  program_name: "",
  sponsor_type: "단기",
  status: "집행전",
  amount_fixed: false,
  amount_free: false,
  goal_amount: null, // 목표 금액 (숫자형으로 저장)
  approval_status: "승인전",
  file_attachment: null,
});

const goList = () => {
  emit("goToList"); // 'goToList' 이벤트를 발생시킴
};
const amountSettingType = ref("지정");
const amountUnits = ref([]); // 금액 단위를 저장할 반응형 리스트
let nextUnitId = 1; // ID는 1부터 시작

// 1. 목표 금액을 위한 Computed 속성 정의 (Getter/Setter 사용)
const formattedGoalAmount = computed({
  get() {
    const value = formData.value.goal_amount;
    // 값이 없으면 빈 문자열 반환
    if (!value) {
      return "";
    }
    return numberFormat(value);
  },
  set(newValue) {
    // 콤마 제거 및 숫자만 추출
    const cleanedValue = newValue.toString().replace(/[^0-9]/g, "");
    // 실제 formData.goal_amount에는 숫자형 값 또는 null을 저장
    formData.value.goal_amount = cleanedValue ? Number(cleanedValue) : null;
  },
});

// 2. 금액 단위 입력 필드 포매팅을 위한 함수 (동적 인풋용)
const formatUnitInput = (unit, event) => {
  const inputElement = event.target;
  const rawValue = inputElement.value;

  // 콤마를 포함한 모든 비숫자 문자 제거 (순수 숫자 추출)
  const cleanedValue = rawValue.toString().replace(/[^0-9]/g, "");

  // amountUnits의 실제 값(value)을 순수 숫자형(또는 null)으로 업데이트
  unit.value = cleanedValue ? Number(cleanedValue) : null;

  // 입력 필드에 표시될 값(rawValue)을 포매팅된 문자열로 덮어씌움
  inputElement.value = numberFormat(unit.value);
};

// 3. '단위 추가' 버튼 클릭 시 실행될 함수
const addUnitInput = () => {
  if (amountSettingType.value === "지정") {
    amountUnits.value.push({
      id: nextUnitId++,
      value: null, // 순수 숫자 값을 저장
    });
  }
};

// 4. '삭제' 버튼 클릭 시 실행될 함수
const removeUnitInput = (id) => {
  amountUnits.value = amountUnits.value.filter((unit) => unit.id !== id);
};

// 폼 제출 핸들러 (예시)
const programAdd = () => {
  console.log("폼 데이터:", formData.value);
  console.log("목표 금액 (순수 숫자):", formData.value.goal_amount);
  console.log("금액 단위 (순수 숫자):", amountUnits.value); // 여기에 실제 서버 전송 로직 구현
};
</script>
<style scoped>
/* ============================================== */
/* 1. 컨테이너 & 기본 설정 */
/* ============================================== */
#container {
  max-width: 700px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f7f9fc;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* 제목 및 구분선 */
h2 {
  color: #1f2937;
  padding-bottom: 5px;
}

hr {
  border: 0;
  height: 1px;
  background: #e5e7eb;
  margin: 15px 0 30px 0;
}

/* ============================================== */
/* 2. Grid 레이아웃 & 폼 요소 */
/* ============================================== */
.form-field-group {
  display: grid;
  /* 라벨(1fr) vs. 인풋 영역(3fr) 비율 */
  grid-template-columns: 1fr 3fr;
  gap: 15px 20px; /* 행 간격 15px, 열 간격 20px */
  align-items: center;
}

/* 라벨 스타일 */
label {
  font-weight: 500;
  color: #4b5563;
  grid-column: 1 / 2;
  margin: 0;
}

/* 인풋/셀렉트 영역 컨테이너 */
.field-container {
  grid-column: 2 / 3;
  display: flex;
  align-items: center;
}

/* 모든 입력 필드 (Input/Select) 기본 스타일 */
input:not([type="radio"]):not([type="file"]):not([type="submit"]):not(
    [type="button"]
  ),
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 15px;
  color: #374151;
  background-color: #ffffff;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

/* 포커스 시 스타일 */
input:focus:not([type="checkbox"]):not([type="file"]):not([type="submit"]):not(
    [type="button"]
  ),
select:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* 체크박스 그룹 */
.checkbox-group {
  gap: 15px;
  font-size: 15px;
  color: #4b5563;
}
.checkbox-group input[type="checkbox"] {
  transform: scale(1.1);
  margin-right: 3px;
}

.field-container .add-button:hover {
  background-color: #059669;
}
#amount_type {
  margin: 10px 0 10px 0;
}
#amount_type button {
  margin-left: 10px;
  width: 100px;
}

/* 첨부파일 */
input[type="file"] {
  border: none;
  padding: 10px 0 10px 0;
}
/* 동적 입력 필드 컨테이너의 상단 마진을 줄여 간격 조정 */
.dynamic-unit-input {
  margin-top: 5px;
  margin-bottom: 5px;
}
.dynamic-unit-input input {
  margin-right: 10px; /* 삭제 버튼과의 간격 확보 */
}

/* '+' 추가 버튼 */
.add-button {
  background-color: #10b981;
  color: white;
  margin-left: 10px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.2s;
  flex-shrink: 0;
}
.add-button:hover {
  background-color: #059669;
}

/* 📌 삭제 버튼 */
.remove-button {
  background-color: #ef4444; /* Red color */
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.2s;
  flex-shrink: 0;
}
.remove-button:hover {
  background-color: #dc2626;
}
/* ============================================== */
/* 3. 최종 버튼 그룹 (등록/닫기) */
/* ============================================== */

/* 최종 버튼들을 감싸는 컨테이너 */
.button-group-footer {
  margin-top: 30px;
  padding-top: 20px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

/* 모든 최종 버튼의 공통 스타일 */
.button-group-footer button {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  border: none;
  transition: background-color 0.2s;
  margin: 0 5px; /* 버튼 간격 */
}

/* '등록' 버튼 (주요 액션) */
.primary-button {
  background-color: #3b82f6; /* 파란색 */
  color: white;
}
.primary-button:hover {
  background-color: #2563eb;
}

/* '닫기' 버튼 (보조 액션) */
.secondary-button {
  background-color: #9ca3af; /* 회색 */
  color: white;
}
.secondary-button:hover {
  background-color: #6b7280;
}

/* ============================================== */
/* 4. 모바일 대응 */
/* ============================================== */
@media (max-width: 600px) {
  #container {
    padding: 20px;
  }
  .form-field-group {
    grid-template-columns: 1fr;
    gap: 0;
  }
  label {
    margin-top: 15px;
    margin-bottom: 5px;
    grid-column: 1 / 2;
  }
  .field-container {
    grid-column: 1 / 2;
  }

  /* 버튼 그룹 모바일에서는 세로로 쌓이도록 */
  .button-group-footer {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .button-group-footer button {
    margin: 0;
  }
}
.amount {
  float: right;
}
</style>
