<template>
  <nav
    class="shadow-none navbar navbar-main navbar-expand-lg border-radius-xl"
    v-bind="$attrs"
    id="navbarBlur"
    data-scroll="true"
    :class="isAbsolute ? 'mt-4' : 'mt-0'"
  >
    <div class="px-3 py-1 container-fluid">
      <!-- 왼쪽에 있는 현재 페이지의 이름 -->
      <breadcrumbs :currentPage="currentRouteName" :color="color" />

      <!-- 중앙 버튼 영역 -->
      <div
        class="header-button-group d-flex justify-content-center align-items-center gap-3 flex-grow-1"
      >
        <router-link to="/test" class="btn btn-outline-primary btn-sm"
          >대기자</router-link
        >
        <router-link to="/test" class="btn btn-outline-info btn-sm"
          >조사지</router-link
        >
        <router-link to="/test" class="btn btn-outline-success btn-sm"
          >상담</router-link
        >
        <router-link to="/sponsor" class="btn btn-outline-success btn-sm"
          >후원</router-link
        >
        <router-link to="/test" class="btn btn-outline-success btn-sm"
          >이벤트</router-link
        >
      </div>

      <!-- 오른쪽 영역 -->
      <div
        class="mt-2 collapse navbar-collapse mt-sm-0 me-md-0 me-sm-4"
        :class="isRTL ? 'px-0' : 'me-sm-4'"
        id="navbar"
      >
        <!-- 오른쪽 아이콘 -->
        <div class="ms-auto d-flex align-items-center">
          <ul class="navbar-nav justify-content-end">
            <!-- 로그인 아이콘 -->
            <li class="nav-item d-flex align-items-center">
              <div
                :to="{ name: 'SignIn' }"
                class="px-0 nav-link font-weight-bold lh-1"
                @click="loginCheck"
                :class="color ? color : 'text-body'"
              >
                <i
                  class="material-icons"
                  :class="isRTL ? 'ms-sm-2' : 'me-sm-1'"
                >
                  account_circle
                </i>
              </div>
            </li>

            <!-- 모바일 사이드바 토글 -->
            <li class="nav-item d-xl-none ps-3 d-flex align-items-center">
              <a
                href="#"
                @click="toggleSidebar"
                class="p-0 nav-link text-body lh-1"
                id="iconNavbarSidenav"
              >
                <div class="sidenav-toggler-inner">
                  <i class="sidenav-toggler-line"></i>
                  <i class="sidenav-toggler-line"></i>
                  <i class="sidenav-toggler-line"></i>
                </div>
              </a>
            </li>

            <!-- 설정 아이콘 -->
            <li class="px-3 nav-item d-flex align-items-center">
              <a
                class="p-0 nav-link lh-1"
                @click="toggleConfigurator"
                :class="color ? color : 'text-body'"
              >
                <i
                  class="material-icons fixed-plugin-button-nav cursor-pointer"
                >
                  settings
                </i>
              </a>
            </li>

            <!-- 알림 메뉴 -->
            <li
              class="nav-item dropdown d-flex align-items-center"
              :class="isRTL ? 'ps-2' : 'pe-2'"
            >
              <a
                href="#"
                class="p-0 nav-link lh-1"
                :class="[color ? color : 'text-body', showMenu ? 'show' : '']"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                @click="showMenu = !showMenu"
              >
                <i class="material-icons cursor-pointer"> notifications </i>
              </a>
              <ul
                class="px-2 py-3 dropdown-menu dropdown-menu-end me-sm-n4"
                :class="showMenu ? 'show' : ''"
                aria-labelledby="dropdownMenuButton"
              >
                <li class="mb-2">
                  <a class="dropdown-item border-radius-md" href="javascript:;">
                    <div class="py-1 d-flex">
                      <div class="my-auto">
                        <img
                          src="../../assets/img/team-2.jpg"
                          class="avatar avatar-sm me-3"
                          alt="user image"
                        />
                      </div>
                      <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-1 text-sm font-weight-normal">
                          <span class="font-weight-bold">New message</span> from
                          Laur
                        </h6>
                        <p class="mb-0 text-xs text-secondary">
                          <i class="fa fa-clock me-1"></i>
                          13 minutes ago
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
                <li class="mb-2">
                  <a class="dropdown-item border-radius-md" href="javascript:;">
                    <div class="py-1 d-flex">
                      <div class="my-auto">
                        <img
                          src="../../assets/img/small-logos/logo-spotify.svg"
                          class="avatar avatar-sm bg-gradient-dark me-3"
                          alt="logo spotify"
                        />
                      </div>
                      <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-1 text-sm font-weight-normal">
                          <span class="font-weight-bold">New album</span> by
                          Travis Scott
                        </h6>
                        <p class="mb-0 text-xs text-secondary">
                          <i class="fa fa-clock me-1"></i>
                          1 day
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a class="dropdown-item border-radius-md" href="javascript:;">
                    <div class="py-1 d-flex">
                      <div
                        class="my-auto avatar avatar-sm bg-gradient-secondary me-3"
                      >
                        <svg
                          width="12px"
                          height="12px"
                          viewBox="0 0 43 36"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlns:xlink="http://www.w3.org/1999/xlink"
                        >
                          <title>credit-card</title>
                          <g
                            stroke="none"
                            stroke-width="1"
                            fill="none"
                            fill-rule="evenodd"
                          >
                            <g
                              transform="translate(-2169.000000, -745.000000)"
                              fill="#FFFFFF"
                              fill-rule="nonzero"
                            >
                              <g transform="translate(1716.000000, 291.000000)">
                                <g
                                  transform="translate(453.000000, 454.000000)"
                                >
                                  <path
                                    class="color-background"
                                    d="M43,10.7482083 L43,3.58333333 C43,1.60354167 41.3964583,0 39.4166667,0 L3.58333333,0 C1.60354167,0 0,1.60354167 0,3.58333333 L0,10.7482083 L43,10.7482083 Z"
                                    opacity="0.593633743"
                                  ></path>
                                  <path
                                    class="color-background"
                                    d="M0,16.125 L0,32.25 C0,34.2297917 1.60354167,35.8333333 3.58333333,35.8333333 L39.4166667,35.8333333 C41.3964583,35.8333333 43,34.2297917 43,32.25 L43,16.125 L0,16.125 Z M19.7083333,26.875 L7.16666667,26.875 L7.16666667,23.2916667 L19.7083333,23.2916667 L19.7083333,26.875 Z M35.8333333,26.875 L28.6666667,26.875 L28.6666667,23.2916667 L35.8333333,23.2916667 L35.8333333,26.875 Z"
                                  ></path>
                                </g>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </div>
                      <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-1 text-sm font-weight-normal">
                          Payment successfully completed
                        </h6>
                        <p class="mb-0 text-xs text-secondary">
                          <i class="fa fa-clock me-1"></i>
                          2 days
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
import Breadcrumbs from '../Breadcrumbs.vue';
import { mapMutations, mapState } from 'vuex';
import { useAuthStore } from '@/store/authLogin';

export default {
  name: "navbar",
  data() {
    return {
      showMenu: false,
    };
  },
  props: ["minNav", "color"],
  created() {
    this.minNav;
  },
  methods: {
    ...mapMutations(["navbarMinimize", "toggleConfigurator"]),

    toggleSidebar() {
      this.navbarMinimize();
    },

    loginCheck() {
      const piniaLogin = useAuthStore();

      if (piniaLogin.isLogin) {
        piniaLogin.logout();
        alert('로그아웃 완료');
        this.$router.push({ name: 'SignIn' });
        return;
      }

      this.$router.push({ name: 'SignIn' });
    },
  },
  components: {
    Breadcrumbs,
  },
  computed: {
    ...mapState(["isRTL", "isAbsolute"]),

    currentRouteName() {
      return this.$route.name;
    },
  },
};
</script>

<style scoped>
.header-button-group .btn {
  border-radius: 8px;
  padding: 5px 14px;
  font-weight: 500;
  transition: 0.2s ease-in-out;
  margin: 0; /* ✅ 불필요한 외부 여백 제거 */
}

.header-button-group .btn:hover {
  opacity: 0.85;
}
</style>
