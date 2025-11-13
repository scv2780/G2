<template>
  <div class="p-6">
    <div id="container">
      <h2 class="text-xl font-bold mb-2">
        후원 프로그램 {{ isEditMode ? "수정" : "등록" }}
      </h2>
      <hr />
      <div class="form-field-group">
        <label for="program_name">프로그램 명</label>
        <div class="field-container">
          <input
            type="text"
            id="program_name"
            name="program_name"
            v-model="formData.program_name"
          />
        </div>

        <label for="program_type">후원유형</label>
        <div class="field-container">
          <select
            id="program_type"
            name="program_type"
            v-model="formData.sponsor_type"
          >
            <option value="단기">단기</option>
            <option value="정기" disabled>정기</option>
          </select>
        </div>

        <label for="program_status">상태</label>
        <div class="field-container">
          <select
            id="program_status"
            name="program_status"
            v-model="formData.status"
          >
            <option value="집행전">진행전</option>
            <option value="집행 중" :disabled="!isEditMode">진행중</option>
            <option value="집행 완료" :disabled="!isEditMode">진행완료</option>
          </select>
        </div>

        <label for="startDate">시작일</label>
        <div class="field-container">
          <input
            type="date"
            name="startDate"
            id="startDate"
            v-model="formData.start_date"
          />
        </div>

        <label for="endDate">종료일</label>
        <div class="field-container">
          <input
            type="date"
            name="endDate"
            id="endDate"
            v-model="formData.end_date"
          />
        </div>
        <label for="amount_setting">금액 단위 설정</label>
        <div class="field-container checkbox-group">
          <button
            type="button"
            class="add-button"
            @click="addUnitInput"
            v-show="amountSettingType === '지정'"
          >
            단위 추가 +
          </button>
        </div>

        <template v-if="amountSettingType === '지정'">
          <template v-for="unit in amountUnits" :key="unit.id">
            <label></label>
            <div class="field-container dynamic-unit-input">
              <input
                type="text"
                inputmode="numeric"
                :id="`unit-${unit.id}`"
                :value="numberFormat(unit.value)"
                @input="formatUnitInput(unit, $event)"
                placeholder="금액 단위를 입력하세요 (예: 10,000)"
                oninput="this.value = this.value.replace(/[^0-9.,]/g, '').replace(/(\..*)\./g, '$1');"
              />
              <button
                type="button"
                class="remove-button"
                @click="removeUnitInput(unit.id)"
              >
                삭제
              </button>
            </div>
          </template>
        </template>

        <label for="amout">목표 금액</label>
        <div class="field-container">
          <input
            type="text"
            id="amout"
            name="amout"
            v-model="formattedGoalAmount"
            inputmode="numeric"
            oninput="this.value = this.value.replace(/[^0-9.,]/g, '').replace(/(\..*)\./g, '$1');"
          />
        </div>

        <label for="">승인</label>
        <div class="field-container">
          <select v-model="formData.approval_status">
            <option value="승인전">승인전</option>
            <option value="승인요청" :disabled="!isEditMode">승인 요청</option>
            <option value="심사중" :disabled="!isEditMode">심사중</option>
            <option value="승인 완료" :disabled="!isEditMode">승인 완료</option>
          </select>
        </div>

        <label>첨부파일</label>
        <div class="field-container">
          <input type="file" />
        </div>
      </div>

      <div class="button-group-footer">
        <button class="primary-button" v-on:click="programAdd()">
          {{ isEditMode ? "수정" : "등록" }}
        </button>
        <button class="secondary-button" v-on:click="goList()">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, watch, defineProps, defineEmits } from "vue";
// import numberFormat from "@/utils/numberFormat"; // 실제 파일 경로에 맞게 주석 해제

const props = defineProps({
  initialProgram: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(["goToList"]);

// ----------------------------------------------------
// 상태 및 헬퍼 함수
// ----------------------------------------------------
const isEditMode = ref(false);
const amountSettingType = ref("지정");
const amountUnits = ref([]);
let nextUnitId = 1;

const formData = ref({
  // DB의 필드명과 일치해야 합니다.
  program_name: "",
  sponsor_type: "단기",
  status: "집행전",
  start_date: null,
  end_date: null,
  goal_amount: null,
  approval_status: "승인전",
  file_attachment: null,
});

// 숫자 포맷팅 임시 함수 (실제로는 utils/numberFormat 파일이 필요합니다)
const numberFormat = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "";
  return value.toLocaleString();
};

const goList = () => {
  emit("goToList");
};

const resetFormData = () => {
  formData.value = {
    program_name: "",
    sponsor_type: "단기",
    status: "집행전",
    start_date: null,
    end_date: null,
    goal_amount: null,
    approval_status: "승인전",
    file_attachment: null,
  };
  amountSettingType.value = "지정";
  amountUnits.value = [];
  nextUnitId = 1;
};

// 금액 단위 데이터를 배열로 변환하는 함수
const parseDonationUnits = (unitStr) => {
  if (!unitStr) return [];
  // 콤마(,)를 기준으로 분리하고, 각 항목을 숫자형으로 변환
  return unitStr
    .split(",")
    .map((val) => {
      const value = Number(val.trim());
      return {
        id: nextUnitId++, // 증가하는 ID 부여
        value: isNaN(value) ? null : value,
      };
    })
    .filter((unit) => unit.value !== null); // 유효하지 않은 값 제거
};

// ----------------------------------------------------
// Props Watcher (수정 모드 진입 로직)
// ----------------------------------------------------
watch(
  () => props.initialProgram,
  (newVal) => {
    if (newVal) {
      //  수정 모드 (데이터 존재)
      isEditMode.value = true;

      // 폼 데이터 채우기 (날짜 포맷 처리 포함)
      formData.value.program_name = newVal.program_name;
      formData.value.sponsor_type = newVal.sponsor_type;
      formData.value.status = newVal.status;
      // DB에서 넘어온 날짜 포맷 (YYYY-MM-DDTHH:MM:SS)을 YYYY-MM-DD로 자릅니다.
      formData.value.start_date = newVal.start_date
        ? newVal.start_date.slice(0, 10)
        : null;
      formData.value.end_date = newVal.end_date
        ? newVal.end_date.slice(0, 10)
        : null;
      formData.value.goal_amount = newVal.goal_amount;
      formData.value.approval_status = newVal.approval_status;

      // 금액 단위 설정 채우기
      amountSettingType.value = newVal.donation_type;
      if (newVal.donation_type === "지정") {
        nextUnitId = 1; // ID 초기화 후 다시 부여
        amountUnits.value = parseDonationUnits(newVal.donation_unit);
      } else {
        amountUnits.value = [];
      }
    } else {
      //  등록 모드 (데이터 없음)
      isEditMode.value = false;
      resetFormData();
    }
  },
  { immediate: true }
);

// ----------------------------------------------------
// Computed & 동적 인풋 핸들러
// ----------------------------------------------------
// 목표 금액을 위한 Computed 속성 정의 (Getter/Setter 사용)
const formattedGoalAmount = computed({
  get() {
    return numberFormat(formData.value.goal_amount);
  },
  set(newValue) {
    const cleanedValue = newValue.toString().replace(/[^0-9]/g, "");
    formData.value.goal_amount = cleanedValue ? Number(cleanedValue) : null;
  },
});

// 금액 단위 입력 필드 포매팅을 위한 함수
const formatUnitInput = (unit, event) => {
  const inputElement = event.target;
  const rawValue = inputElement.value;
  const cleanedValue = rawValue.toString().replace(/[^0-9]/g, "");

  unit.value = cleanedValue ? Number(cleanedValue) : null;
  inputElement.value = numberFormat(unit.value);
};

// '단위 추가' 버튼 클릭 시 실행될 함수
const addUnitInput = () => {
  if (amountSettingType.value === "지정") {
    amountUnits.value.push({
      id: nextUnitId++,
      value: null,
    });
  }
};

// '삭제' 버튼 클릭 시 실행될 함수
const removeUnitInput = (id) => {
  amountUnits.value = amountUnits.value.filter((unit) => unit.id !== id);
};

// ----------------------------------------------------
// 최종 제출 로직 (등록/수정)
// ----------------------------------------------------
const programAdd = async () => {
  const actionText = isEditMode.value ? "수정" : "등록";

  // 1. 금액 단위 문자열 생성
  let donationUnit;
  if (amountSettingType.value === "지정") {
    const validUnits = amountUnits.value
      .map((unit) => unit.value)
      .filter((value) => value !== null && value > 0);
    donationUnit = validUnits.length > 0 ? validUnits.join(",") : null;
  } else {
    donationUnit = null;
  }

  // 2. 공통 데이터 객체 생성
  let obj = {
    program_name: formData.value.program_name,
    sponsor_type: formData.value.sponsor_type,
    status: formData.value.status,
    start_date: formData.value.start_date,
    end_date: formData.value.end_date,
    donation_type: amountSettingType.value,
    donation_unit: donationUnit,
    goal_amount: formData.value.goal_amount || 0,
    approval_status: formData.value.approval_status,

    // 3. 등록/수정에 따라 달라지는 필드 처리
    program_code: props.initialProgram?.program_code, // 수정 시에만 필요
    current_amount: props.initialProgram?.current_amount || 0, // 수정 시 기존 값 유지
    writer: props.initialProgram?.writer || "admin_temp", // 수정 시 기존 값 유지
    create_date: new Date().toISOString().slice(0, 10), // 등록 시 오늘 날짜
  };

  console.log(`${actionText}을 위한 최종 데이터 객체:`, obj);

  try {
    let response;
    if (isEditMode.value) {
      //  수정 요청: PUT/PATCH /api/sponsor/:code (백엔드 구현 필요)
      // 임시로 POST 사용하지만, 백엔드에서 PUT/PATCH로 변경해야 합니다.
      // URL: /api/sponsor/:code
      response = await axios.put(`/api/sponsor/${obj.program_code}`, obj);
    } else {
      // 등록 요청: POST /api/sponsor
      response = await axios.post("/api/sponsor", obj);
    }

    console.log(` 프로그램 ${actionText} 성공:`, response.data);
    alert(`프로그램이 성공적으로 ${actionText}되었습니다.`);
    goList();
  } catch (error) {
    console.error(`프로그램 ${actionText} 실패:`, error);
    if (error.response) {
      alert(
        `${actionText} 실패: ${error.response.data.message || "서버 오류 발생"}`
      );
    } else {
      alert(`${actionText} 실패: 서버에 연결할 수 없습니다.`);
    }
  }
};
</script>
<style scoped>
/* (스타일 시트 내용은 변경하지 않았습니다.) */
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
