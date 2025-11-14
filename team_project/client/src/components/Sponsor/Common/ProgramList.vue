<template>
  <div class="p-6">
    <div>
      <div>
        <h2 class="text-xl font-bold mb-2">후원 프로그램 관리</h2>
        <button id="proAdd" v-on:click="programAdd()">
          후원 프로그램 등록
        </button>
        <hr class="clear-fix" />
      </div>
      <div id="search">
        <input type="date" v-model="startDate" />~<input
          type="date"
          v-model="endDate"
        />
        <span>프로그램 명</span>
        <select name="program_select" id="program_select" v-model="programCode">
          <option value="" selected>-- 전체 프로그램 --</option>
          <option
            v-for="program in programList"
            :key="program.program_code"
            :value="program.program_code"
          >
            {{ program.program_name }}
          </option>
        </select>
        <span>후원 방법</span>
        <select name="" id="" v-model="sponsorType">
          <option value="" selected>-- 전체 --</option>
          <option value="단기">단기</option>
          <option value="정기">정기</option>
        </select>
        <!-- <span>금액</span>
        <input
          type="text"
          v-model="amount"
          class="inputBox"
          oninput="this.value = this.value.replace(/[^0-9.,]/g, '').replace(/(\..*)\./g, '$1');"
        /> -->
        <span>진행</span>
        <select name="" id="" v-model="status">
          <option value="" selected>-- 전체 --</option>
          <option value="집행전">집행전</option>
          <option value="집행 중">집행 중</option>
          <option value="집행 완료">집행 완료</option>
          <option value="집행 불가">집행 불가</option>
        </select>
        <span>승인</span>
        <select name="" id="" v-model="approval_status">
          <option value="" selected>-- 전체 --</option>
          <option value="승인전">승인전</option>
          <option value="승인요청">승인 요청</option>
          <option value="승인완료">승인 완료</option>
        </select>
        <button v-on:click="search()">검색</button>
        <button v-on:click="clear()">조건 초기화</button>
      </div>
      <hr />
      <table border="1" cellpadding="8" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>프로그램</th>
            <th>후원 종류</th>
            <th>상태</th>
            <th>시작일</th>
            <th>종료일</th>
            <th>목표 금액</th>
            <th>현재 금액</th>
            <th>승인</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="program in sponsorList"
            @click="selectProgram(program)"
            :key="program.program_code"
          >
            <td>{{ program.program_name }}</td>
            <td>{{ program.sponsor_type }}</td>
            <td>{{ program.status }}</td>
            <td>{{ dateFormat(program.start_date, "yyyy-MM-dd") }}</td>
            <td>{{ dateFormat(program.end_date, "yyyy-MM-dd") }}</td>
            <td>{{ numberFormat(program.goal_amount) }}원</td>
            <td>{{ numberFormat(program.current_amount) }}원</td>
            <td>{{ program.approval_status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<!-- ============================================================= -->

<script setup>
import axios from "axios";
import dateFormat from "@/utils/dateFormat";
import numberFormat from "@/utils/numberFormat";
import { ref, onBeforeMount } from "vue";
const emit = defineEmits(["go-to-add", "selectProgram"]);
let startDate = ref("");
let endDate = ref("");
let programCode = ref(""); // 프로그램 Select의 값
let sponsorType = ref(""); // 후원 방법 Select의 값
// let amount = ref(null); // 금액 Input의 값
let status = ref(""); // 승인 Select의 값
let approval_status = ref(""); // 승인 Select의 값
let sponsorList = ref([]); // 전체 조회 조건 조회
let programList = ref([]); // 검색창 프로그램 명 리스트 불러오기
const getSponsorList = async (params = {}) => {
  let result = await axios
    .get(`/api/sponsor`, { params: params })
    .catch((err) => console.log(err));

  // API 호출 실패 처리 추가 (이전 대화에서 논의된 부분)
  if (!result || !result.data) {
    console.log("조회 결과 데이터가 유효하지 않습니다.");
    sponsorList.value = [];
    return;
  }
  const res = result.data.serviceSponsor;

  // 1. 테이블 목록 갱신
  sponsorList.value = JSON.parse(JSON.stringify(res));

  console.log(sponsorList.value);
  // 2. 검색 조건이 없는 최초 로딩 시에만 programList를 갱신
  //    (검색 결과는 programList에 영향을 주지 않아야 함)
  if (Object.keys(params).length === 0) {
    programList.value = JSON.parse(JSON.stringify(res));
  }
  console.log(JSON.parse(JSON.stringify(sponsorList.value)));
};

onBeforeMount(() => {
  getSponsorList();
});
defineExpose({
  getSponsorList,
});
const search = () => {
  const searchParams = {
    startDate: startDate.value,
    endDate: endDate.value,
    programCode: programCode.value,
    sponsorType: sponsorType.value,
    // amount: amount.value,
    status: status.value,
    approval_status: approval_status.value,
  };

  // getSponsorList 함수를 검색 파라미터와 함께 호출
  console.log(searchParams);
  getSponsorList(searchParams);
};

const programAdd = () => {
  emit("go-to-add"); // 'go-to-add' 이벤트를 발생시킴
};

const clear = () => {
  startDate.value = "";
  endDate.value = "";
  programCode.value = "";
  sponsorType.value = "";
  // amount.value = null;
  status.value = "";
  approval_status.value = "";
  getSponsorList(); // 전체 리스트 다시 조회
};

const selectProgram = async (program) => {
  // async 함수로 변경
  console.log("선택된 프로그램:", program);

  // 1. 단건 조회 API 호출
  // 단건 조회 API 경로가 /api/sponsor/:no 형태라고 가정하고 호출합니다.
  let result;
  try {
    result = await axios.get(`/api/sponsor/${program.program_code}`);
  } catch (err) {
    console.error("단건 조회 API 호출 실패:", err);
    alert("프로그램 상세 정보를 불러오는 데 실패했습니다.");
    return;
  }

  // 2. 응답 데이터 처리
  const programDetail = result.data.serviceSponsor[0]; // 보통 단건 조회는 배열의 첫 번째 요소입니다.

  // 3. 상위 컴포넌트로 데이터와 함께 이벤트 발생
  if (programDetail) {
    emit("select-program", programDetail); // 'select-program' 이벤트를 상세 데이터와 함께 발생시킵니다.
  }
};
</script>

<!-- ============================================================= -->

<style scoped>
/* div#search에 Flexbox 적용 */
#search {
  display: flex; /* 자식 요소들을 유연하게 배치 */
  align-items: center; /* 수직 중앙 정렬 */
  gap: 15px; /* 요소들 사이의 기본 간격 설정 */
  flex-wrap: wrap; /* 창 크기가 줄어들면 줄바꿈 허용 (안전성) */
}

/* 금액 입력 input의 너비 유지 */
.inputBox {
  width: 100px;
}
.clear-fix {
  clear: both; /* float된 요소 아래에서 시작하도록 강제 */
  /* 필요하다면 hr의 기본 margin을 제거/조정하여 간격 제어 */
  margin-top: 0;
  margin-bottom: 20px;
}

#proAdd {
  float: left; /* 이 스타일은 유지 */
  margin-left: 0;
  margin-bottom: 10px; /* hr이 clear 되었으므로 이 간격은 버튼과 다음 요소 사이에 생깁니다. */
  padding: 8px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Select와 Input 요소의 기본 너비를 조절하여 보기 좋게 만듭니다. */
#search input[type="date"],
#search select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 금액 input 뒤의 '승인' 텍스트를 Input과 붙여주기 위해 약간 조정 */
#search input[type="number"] {
  margin-right: -10px;
}

/* 검색 버튼 스타일 조정 */
#search button {
  padding: 6px 15px;
  background-color: #007bff; /* 파란색 배경 (예시) */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
tbody tr:hover {
  cursor: pointer;
  background-color: gray;
  opacity: 0.5;
  color: white;
}
</style>
