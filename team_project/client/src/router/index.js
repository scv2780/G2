// index.js
import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import Billing from "../views/Billing.vue";
// import RTL from "../views/Rtl.vue";
import Notifications from "../views/Notifications.vue";
import Profile from "../views/Profile.vue";
import SignIn from "../views/SignIn.vue";
import SignUp from "../views/SignUp.vue";
import Test from "../views/Test.vue";
import Sponsor from "../views/Sponsor/Sponsor.vue";
import EventMain from "../views/EventMain.vue";
import EventList from "../views/EventList.vue";
import EventForm from "../views/EventForm.vue";
import organization from "../views/organization.vue";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard",
  },
  {
    path: "/test",
    name: "Test",
    component: Test,
  },
  {
    path: "/sponsor",
    name: "Sponsor",
    component: Sponsor,
  },
  {
    path: "/organization",
    name: "organization",
    component: organization,
  },
  {
    path: "/managerApprovals",
    name: "ManagerApprovals",
    component: () => import("../views/ManagerApprovals.vue"),
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
  },
  {
    path: "/billing",
    name: "Billing",
    component: Billing,
  },
  // {
  //   path: "/rtl-page",
  //   name: "RTL",
  //   component: RTL,
  // },
  {
    path: "/notifications",
    name: "Notifications",
    component: Notifications,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/sign-in",
    name: "SignIn",
    component: SignIn,
  },
  {
    path: "/sign-up",
    name: "SignUp",
    component: SignUp,
  },
  // 조사지 버전 목록
  {
    path: "/survey-version",
    name: "surveyVersion",
    component: () => import("../views/SurveyVersion.vue"),
  },

  // 조사지 추가 (제작)
  {
    path: "/survey/new",
    name: "survey-new",
    component: () => import("../views/SurveyNew.vue"),
  },

  // 조사지 작성 (최신 템플릿으로 응답 작성)
  {
    path: "/survey/write",
    name: "survey-write",
    component: () => import("../views/SurveyWrite.vue"),
  },

  // 조사지 버전 상세
  {
    path: "/survey/detail/:templateCode",
    name: "survey-detail",
    component: () => import("../views/SurveyDetail.vue"),
    props: true,
  },

  // 조사지 버전 수정
  {
    path: "/survey/edit/:id",
    name: "survey-edit",
    component: () => import("../views/SurveyEdit.vue"),
    props: true,
  },

  // 제출본 목록 (역할별)
  {
    path: "/survey-list",
    name: "surveyList",
    component: () => import("../views/SurveyList.vue"),
  },

  // 제출본 상세
  {
    path: "/survey/submission/:submitCode",
    name: "surveySubmissionDetail",
    component: () => import("../views/SurveySubmissionDetail.vue"),
    props: true,
  },

  // 제출본 수정
  {
    path: "/survey/submission/:submitCode/edit",
    name: "surveySubmissionEdit",
    component: () => import("../views/SurveySubmissionEdit.vue"),
    props: true,
  },

  // 담당자 배정
  {
    path: "/assign-manager/:submitCode",
    name: "assignManager",
    component: () => import("../views/AssignManager.vue"),
    props: true,
  },
  // 이벤트 메인페이지
  {
    path: "/event",
    name: "EventMain",
    component: EventMain,
  },
  // 이벤트 목록
  {
    path: "/event/list",
    name: "EventList",
    component: EventList,
  },
  // 이벤트 등록
  {
    path: "/event/add",
    name: "EventAdd",
    component: EventForm,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;
