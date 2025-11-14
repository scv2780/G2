<template>
  <div
    class="w-auto h-auto collapse navbar-collapse max-height-vh-100 h-100"
    id="sidenav-collapse-main"
  >
    <ul class="navbar-nav">
      <li class="mt-3 nav-item">
        <h6
          class="text-xs ps-4 text-uppercase font-weight-bolder text-white"
          :class="$store.state.isRTL ? 'me-4' : 'ms-2'"
        >
          후원 관리자 페이지
        </h6>
      </li>

      <li class="nav-item">
        <sidenav-collapse
          url="#"
          :aria-controls="''"
          v-bind:collapse="false"
          collapseRef="sponsor"
          navText="후원 프로그램 관리"
        >
          <!-- navText = 표시되는 이름 -->
          <!-- collapseRef = 링크 주소 /{에들어갈 주소} -->
        </sidenav-collapse>
      </li>

      <li class="nav-item">
        <sidenav-collapse
          url="#"
          :aria-controls="''"
          v-bind:collapse="false"
          collapseRef="tables"
          navText="담당자 관리"
        >
        </sidenav-collapse>
      </li>

      <li class="nav-item">
        <sidenav-collapse
          url="#"
          :aria-controls="''"
          v-bind:collapse="false"
          collapseRef="billing"
          navText="전체 후원 거래 내역서"
        >
        </sidenav-collapse>
      </li>

      <li class="nav-item">
        <sidenav-collapse
          url="#"
          :aria-controls="''"
          v-bind:collapse="false"
          collapseRef="rtl-page"
          navText="활동 보고서"
        >
        </sidenav-collapse>
      </li>

      <li class="nav-item">
        <sidenav-collapse
          url="#"
          :aria-controls="''"
          v-bind:collapse="false"
          collapseRef="notifications"
          navText="총괄표 관리"
        >
        </sidenav-collapse>
      </li>

      <li class="nav-item">
        <sidenav-collapse
          url="#"
          :aria-controls="''"
          v-bind:collapse="false"
          collapseRef="profile"
          navText="후원 보고서 관리"
        >
        </sidenav-collapse>
      </li>

      <li class="nav-item">
        <sidenav-collapse
          url="#"
          :aria-controls="''"
          v-bind:collapse="false"
          collapseRef="sign-in"
          navText="분기 통지 / 발송 이력"
        >
        </sidenav-collapse>
      </li>
    </ul>
  </div>
</template>
<script>
// (Script 부분은 변경 없음)
import SidenavCollapse from "./SidenavCollapse.vue";

export default {
  name: "SidenavList",

  // props: {
  //   /** ✔ 여기서 menu props 정의 */
  //   menu: Object,
  //   cardBg: String,
  // },

  components: {
    SidenavCollapse,
  },

  data() {
    return {
      title: "Soft UI Dashboard PRO",
      controls: "dashboardsExamples",
      isActive: "active",
    };
  },
};
</script>
