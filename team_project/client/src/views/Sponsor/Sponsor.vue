<template>
  <div class="p-6">
    <ProgramList v-if="showList" @go-to-add="goToAdd" />

    <ProgramAdd v-if="!showList" @goToList="goToList" />
  </div>
</template>

<script setup>
import ProgramList from "@/components/Sponsor/ProgramList.vue";
import ProgramAdd from "@/components/Sponsor/ProgramAdd.vue";
import { ref } from "vue";

let showList = ref(true); // 화면 상태 관리

const goToAdd = () => {
  showList.value = false; // ProgramAdd 화면 표시
};

const goToList = () => {
  showList.value = true; // ProgramList 화면 표시
};
</script>
