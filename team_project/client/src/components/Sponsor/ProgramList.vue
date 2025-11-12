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
            v-for="program in sponsorList"
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
        <span>금액</span>
        <input type="number" v-model="amount" class="inputBox" />
        <span>승인</span>
        <select name="" id="" v-model="status">
          <option value="" selected>-- 전체 --</option>
          <option value="요청전">요청전</option>
          <option value="승인요청">승인 요청</option>
          <option value="승인완료">승인 완료</option>
        </select>
        <button v-on:click="search()">검색</button>
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="program in sponsorList" :key="program.program_code">
            <td>{{ program.program_name }}</td>
            <td>{{ program.sponsor_type }}</td>
            <td>{{ program.status }}</td>
            <td>{{ dateFormat(program.start_date, "yyyy-MM-dd") }}</td>
            <td>{{ dateFormat(program.end_date, "yyyy-MM-dd") }}</td>
            <td>{{ numberFormat(program.goal_amount) }}원</td>
            <td>{{ numberFormat(program.current_amount) }}원</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import axios from "axios";
import dateFormat from "@/utils/dateFormat";
import numberFormat from "@/utils/numberFormat";
import { ref, onBeforeMount } from "vue";
const emit = defineEmits(["go-to-add"]);
let startDate = ref("");
let endDate = ref("");
let programCode = ref(""); // 프로그램 Select의 값
let sponsorType = ref(""); // 후원 방법 Select의 값
let amount = ref(null); // 금액 Input의 값
let status = ref(""); // 승인 Select의 값
let sponsorList = ref([]);
const getSponsorList = async (params = {}) => {
  let result = await axios
    .get(`/api/sponsor`, { params: params })
    .catch((err) => console.log(err));

  const res = result.data.serviceSponsor;
  sponsorList.value = JSON.parse(JSON.stringify(res));
  console.log(JSON.parse(JSON.stringify(sponsorList.value)));
};

onBeforeMount(() => {
  getSponsorList();
});

const search = () => {
  const searchParams = {
    startDate: startDate.value,
    endDate: endDate.value,
    programCode: programCode.value,
    sponsorType: sponsorType.value,
    amount: amount.value,
    status: status.value,
  };

  // getSponsorList 함수를 검색 파라미터와 함께 호출
  // getSponsorList(searchParams);
  console.log(searchParams);
};

const programAdd = () => {
  emit("go-to-add"); // 'go-to-add' 이벤트를 발생시킴
};
</script>

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
</style>
