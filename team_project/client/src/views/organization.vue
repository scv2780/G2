<!-- src/views/organization.vue -->
<template>
  <div class="org-page">
    <!-- 상단 툴바 -->
    <div class="toolbar">
      <div class="filters">
        <select v-model="searchType" class="select">
          <option value="name">기관명</option>
          <option value="code">기관번호</option>
          <option value="address">주소</option>
          <option value="phone">연락처</option>
        </select>

        <input
          v-model.trim="keyword"
          class="input"
          type="text"
          placeholder="검색어를 입력하세요"
          @keyup.enter="onSearch"
        />

        <select v-model="sortType" class="select">
          <option value="recent">최근 등록순</option>
          <option value="nameAsc">이름(가나다)</option>
          <option value="startDesc">시작일 최신</option>
          <option value="endDesc">종료일 최신</option>
        </select>

        <select v-model="statusType" class="select">
          <option value="ALL">전체</option>
          <option value="RUNNING">운영</option>
          <option value="END">종료</option>
        </select>
      </div>

      <button class="btn primary" @click="openAdd">추가</button>
    </div>

    <!-- 목록 -->
    <div v-if="paged.length === 0" class="empty">데이터가 없습니다.</div>
    <ul v-else class="org-list">
      <li v-for="org in paged" :key="org.id" class="org-item">
        <div class="org-main">
          <div class="org-title">
            <strong>{{ org.code }}</strong>
            <span class="sep">|</span>
            <strong>{{ org.name }}</strong>
            <span
              class="badge"
              :class="org.status === 'RUNNING' ? 'green' : 'gray'"
            >
              {{ org.status === "RUNNING" ? "운영" : "종료" }}
            </span>
          </div>
          <div class="org-sub">
            {{ org.address }} | {{ org.phone }} |
            {{ fmtDate(org.startDate) }} 시작 |
            {{ org.endDate ? fmtDate(org.endDate) : "-" }} 종료 | 운영여부:
            {{ org.status === "RUNNING" ? "운영" : "종료" }}
          </div>
        </div>

        <div class="org-actions">
          <button class="btn" @click.stop="openEdit(org)">수정</button>
          <button class="btn danger" @click="remove(org)">삭제</button>
        </div>
      </li>
    </ul>

    <!-- 수정 모달 -->
    <teleport to="body">
      <div
        v-if="isModalOpen"
        class="org-modal-backdrop"
        @click.self="closeModal"
      >
        <div class="org-modal" @click.stop>
          <h3>기관 정보 수정</h3>

          <div class="grid">
            <label>기관명</label>
            <input
              class="input"
              v-model.trim="form.name"
              placeholder="기관명"
            />

            <label>주소</label>
            <input
              class="input"
              v-model.trim="form.address"
              placeholder="주소"
            />

            <label>연락처</label>
            <input
              class="input"
              v-model.trim="form.phone"
              placeholder="연락처"
            />

            <label>시작일자</label>
            <input class="input" type="date" v-model="form.startDate" />

            <label>종료일자</label>
            <input class="input" type="date" v-model="form.endDate" />

            <label>운영여부</label>
            <select class="select" v-model="form.status">
              <option value="RUNNING">운영</option>
              <option value="END">종료</option>
            </select>
          </div>

          <div class="modal-actions">
            <button class="btn" @click="closeModal">취소</button>
            <button class="btn primary" @click="onModalSave">저장</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 추가 모달 -->
    <teleport to="body">
      <div v-if="isAddOpen" class="org-modal-backdrop" @click.self="closeAdd">
        <div class="org-modal" @click.stop>
          <h3>기관 추가</h3>

          <div class="grid">
            <label>기관명</label>
            <input
              class="input"
              v-model.trim="addForm.name"
              placeholder="기관명"
            />

            <label>주소</label>
            <input
              class="input"
              v-model.trim="addForm.address"
              placeholder="주소"
            />

            <label>연락처</label>
            <input
              class="input"
              v-model.trim="addForm.phone"
              placeholder="연락처"
            />

            <label>시작일자</label>
            <input class="input" type="date" v-model="addForm.startDate" />

            <label>종료일자</label>
            <input class="input" type="date" v-model="addForm.endDate" />

            <label>운영여부</label>
            <select class="select" v-model="addForm.status">
              <option value="RUNNING">운영</option>
              <option value="END">종료</option>
            </select>
          </div>

          <div class="modal-actions">
            <button class="btn" @click="closeAdd">취소</button>
            <button class="btn primary" @click="onAddSave">추가</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";

// DB/서버에서 온 어떤 날짜든 input[type=date]에 맞게 'YYYY-MM-DD'로 변환
function toDateInput(val) {
  if (!val) return "";
  if (typeof val === "string") {
    // 'YYYY-MM-DD...' 형식이면 앞 10자리만
    const s = val.replace(/\./g, "-"); // 혹시 2025.01.02 형태면 '-'로
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  }
  // Date 객체나 숫자 타임스탬프가 올 수도 있음
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ===== 상태 ===== */
const searchType = ref("name");
const keyword = ref("");
const sortType = ref("recent");
const statusType = ref("ALL");
const list = ref([]);

/* 모달 상태 */
const isModalOpen = ref(false);
const form = ref({
  code: "", // 내부 키
  name: "",
  address: "",
  phone: "",
  startDate: "", // 'YYYY-MM-DD'
  endDate: "", // 'YYYY-MM-DD' 또는 ""
  status: "RUNNING",
});

let editingCode = "";

/* ===== 유틸 ===== */
function fmtDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ===== 데이터 로드 ===== */
async function load() {
  const res = await axios.get("/api/organization");
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  list.value = rows.map((r) => ({
    id: r.org_code,
    code: r.org_code,
    name: r.org_name,
    address: r.address,
    phone: r.org_phone,
    startDate: toDateInput(r.start_date),
    endDate: toDateInput(r.end_date),
    status: r.status,
  }));
}

/* ===== 수정 모달 ===== */
function openEdit(org) {
  editingCode = org.code;
  form.value = {
    code: org.code,
    name: org.name ?? "",
    address: org.address ?? "",
    phone: org.phone ?? "",
    startDate: org.startDate ?? "", // 이미 리스트 매핑에 있음
    endDate: org.endDate ?? "",
    status: org.status ?? "RUNNING",
  };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

// 저장(업데이트) 시 날짜 포함해서 전달
async function onModalSave() {
  if (!form.value.name.trim()) return alert("기관명을 입력하세요.");
  if (!["RUNNING", "END"].includes(form.value.status))
    return alert("운영여부가 올바르지 않습니다.");

  const payload = {
    org_name: form.value.name,
    address: form.value.address,
    org_phone: form.value.phone,
    start_date: form.value.startDate || null,
    end_date: form.value.endDate || null,
    status: form.value.status,
  };

  await axios.put(
    `/api/organization/${encodeURIComponent(editingCode)}`,
    payload
  );

  // 로컬 갱신
  const i = list.value.findIndex((x) => x.code === editingCode);
  if (i !== -1) {
    list.value[i] = {
      ...list.value[i],
      name: form.value.name,
      address: form.value.address,
      phone: form.value.phone,
      startDate: form.value.startDate || null,
      endDate: form.value.endDate || null,
      status: form.value.status,
    };
  }
  closeModal();
}

//삭제
async function remove(org) {
  if (!confirm(`[${org.code}] ${org.name} 을(를) 삭제할까요?`)) return;
  await axios.delete(`/api/organization/${encodeURIComponent(org.code)}`);
  // 로컬 목록에서 바로 제거
  list.value = list.value.filter((x) => x.code !== org.code);
}

// 추가 모달 상태
const isAddOpen = ref(false);
const addForm = ref({
  name: "",
  address: "",
  phone: "",
  startDate: "",
  endDate: "",
  status: "RUNNING",
});

function openAdd() {
  addForm.value = {
    name: "",
    address: "",
    phone: "",
    startDate: "",
    endDate: "",
    status: "RUNNING",
  };
  isAddOpen.value = true;
}
function closeAdd() {
  isAddOpen.value = false;
}

// 추가 저장
async function onAddSave() {
  if (!addForm.value.name.trim()) return alert("기관명을 입력하세요.");
  if (!["RUNNING", "END"].includes(addForm.value.status))
    return alert("운영여부가 올바르지 않습니다.");

  const payload = {
    org_name: addForm.value.name,
    address: addForm.value.address,
    org_phone: addForm.value.phone,
    start_date: addForm.value.startDate || null,
    end_date: addForm.value.endDate || null,
    status: addForm.value.status,
  };

  await axios.post("/api/organization", payload);
  await load(); // 목록 새로고침
  closeAdd();
}

/* 더미 핸들러 */
function onSearch() {}

/* ===== 필터/정렬 ===== */
const filtered = computed(() => {
  let data = [...list.value];

  if (statusType.value !== "ALL") {
    data = data.filter((d) => d.status === statusType.value);
  }

  const kw = keyword.value.trim().toLowerCase();
  if (kw) {
    data = data.filter((d) => {
      const map = {
        name: d.name ?? "",
        code: d.code ?? "",
        address: d.address ?? "",
        phone: d.phone ?? "",
      };
      return String(map[searchType.value] || "")
        .toLowerCase()
        .includes(kw);
    });
  }

  switch (sortType.value) {
    case "nameAsc":
      data.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "ko"));
      break;
    case "startDesc":
      data.sort(
        (a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0)
      );
      break;
    case "endDesc":
      data.sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0));
      break;
  }

  return data;
});

const paged = computed(() => filtered.value);

/* 선택: 모달 열릴 때 스크롤 잠금 */
watch(isModalOpen, (v) => {
  document.documentElement.style.overflow = v ? "hidden" : "";
});

onMounted(load);
</script>

<style scoped>
.org-page {
  max-width: 980px;
  margin: 32px auto;
  padding: 0 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.input,
.select {
  padding: 8px 10px;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  min-width: 160px;
  outline: none;
}

.btn {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  background: #fff;
  cursor: pointer;
}
.btn:hover {
  filter: brightness(0.98);
}
.btn.primary {
  background: #4f7cff;
  border-color: #4f7cff;
  color: #fff;
}
.btn.danger {
  background: #ff6666;
  border-color: #ff6666;
  color: #fff;
}

.org-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.org-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #f8f9fb;
  border: 1px solid #e8e8e8;
}

.org-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}
.sep {
  opacity: 0.35;
}
.org-sub {
  margin-top: 6px;
  color: #666;
  font-size: 13px;
}

.badge {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #ddd;
}
.badge.green {
  background: #e7f7ec;
  border-color: #b9e6c3;
  color: #207a3a;
}
.badge.gray {
  background: #efefef;
  border-color: #e0e0e0;
  color: #666;
}

.org-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

/* ==== 여기서부터 모달 (Bootstrap과 클래스명 충돌 방지) ==== */
.org-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 2147483647; /* 최상위 */
}
.org-modal {
  width: min(680px, 92vw);
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  border: 1px solid #e8e8e8;
}
.grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px 12px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.empty {
  text-align: center;
  color: #666;
  padding: 24px 0;
}
</style>
