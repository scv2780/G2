<template>
  <div class="bg-white">
    <div class="container top-0 position-sticky z-index-sticky">
      <div class="row">
        <div class="col-12">
          <navbar
            isBlur="blur my-3 py-2 mt-4 start-0 end-0 mx-4 shadow blur border-radius-lg"
            btnBackground="bg-gradient-success"
            v-bind:darkMode="true"
          />
        </div>
      </div>
    </div>
    <main class="mt-0 main-content">
      <section>
        <div class="page-header min-vh-100">
          <div class="container">
            <div class="row">
              <div
                class="col-6 d-lg-flex d-none h-100 my-auto pe-0 ps-0 position-absolute top-0 start-0 text-center justify-content-center flex-column"
              >
                <div
                  class="position-relative h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center"
                  :style="{
                    backgroundImage:
                      'url(' +
                      require('@/assets/img/illustrations/illustration-signin.jpg') +
                      ')',
                  }"
                ></div>
              </div>
              <div
                class="col-xl-4 col-lg-5 col-md-7 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-5"
              >
                <div class="card card-plain">
                  <div class="pb-0 card-header bg-transparent mb-4">
                    <h4 class="font-weight-bolder">회원가입</h4>
                    <p class="mb-0">대충 설명하는 곳</p>
                  </div>
                  <div class="card-body">
                    <!-- from -->
                    <form role="form" @submit.prevent v-if="step === 1">
                      <!-- 아이디 -->
                      <div class="mb-3">
                        <div class="d-flex align-items-end">
                          <!-- 아이디 입력창 -->
                          <div class="flex-grow-1 me-2">
                            <material-input
                              id="user-id"
                              type="text"
                              label="여긴 아이디"
                              size="lg"
                              v-model="userId"
                            />
                          </div>

                          <!-- 중복확인 버튼 -->
                          <material-button
                            variant="gradient"
                            color="success"
                            size="lg"
                            class="py-2 px-3"
                            type="button"
                            @click="checkId"
                          >
                            중복확인
                          </material-button>
                        </div>
                      </div>

                      <!-- 비밀번호 -->
                      <div class="mb-3">
                        <material-input
                          id="user-pw"
                          type="password"
                          label="여긴 비밀번호"
                          size="lg"
                          v-model="userPw"
                        />
                      </div>

                      <!-- 비밀번호 확인 -->
                      <div class="mb-3">
                        <material-input
                          id="user-pw-check"
                          type="password"
                          label="여긴 비밀번호 확인"
                          size="lg"
                          v-model="pwCheck"
                        />
                      </div>

                      <!-- 이용약관 체크박스 -->
                      <material-checkbox
                        id="flexCheckDefault"
                        class="font-weight-light"
                        v-model="agree"
                      >
                        이용약관 동의합니다 체크박스
                        <a
                          href="../../../pages/privacy.html"
                          class="text-dark font-weight-bolder"
                          >대충 이건 이용약관</a
                        >
                      </material-checkbox>

                      <!-- 가입 유형 선택 -->
                      <div class="d-flex justify-content-between gap-3 mt-4">
                        <!-- 개인 회원 -->
                        <material-button
                          variant="gradient"
                          color="success"
                          size="lg"
                          class="w-45"
                          type="button"
                          @click="goToStep('user')"
                          >개인 회원</material-button
                        >

                        <!-- 기관 회원 -->
                        <material-button
                          variant="gradient"
                          color="success"
                          size="lg"
                          class="w-45"
                          type="button"
                          @click="goToStep('org')"
                          >기관 회원</material-button
                        >
                      </div>
                    </form>

                    <!-- 개인 회원 -->
                    <sign-up-user-form
                      v-else-if="step === 'user'"
                      :base="{ userId, userPw, agree }"
                      @submit="signUpSubmit('user', $event)"
                      @back="step = 1"
                    />

                    <!-- 기관 회원 -->
                    <sign-up-org-form
                      v-else-if="step === 'org'"
                      :base="{ userId, userPw, agree }"
                      @submit="signUpSubmit('org', $event)"
                      @back="step = 1"
                    />
                  </div>
                  <div class="px-1 pt-0 text-center card-footer px-lg-2">
                    <p class="mx-auto mb-4 text-sm">
                      이미 계정이 있어요?
                      <router-link
                        :to="{ name: 'SignIn' }"
                        class="text-success text-gradient font-weight-bold"
                        >그냥 로그인 ㄱㄱ</router-link
                      >
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import Navbar from '@/examples/PageLayout/Navbar.vue';
import MaterialInput from '@/components/MaterialInput.vue';
import MaterialCheckbox from '@/components/MaterialCheckbox.vue';
import MaterialButton from '@/components/MaterialButton.vue';
const body = document.getElementsByTagName('body')[0];
import { mapMutations } from 'vuex';
import SignUpUserForm from '@/components/SignUpUserForm.vue';
import SignUpOrgForm from '@/components/SignUpOrgForm.vue';
import { checkId as checkUserId, addUser, addOrg } from '../api/user';
import dateFormat from '../utils/dateFormat';

const today = dateFormat(new Date(), 'yyyy-MM-dd');

export default {
  name: 'sign-up',
  components: {
    Navbar,
    MaterialInput,
    MaterialCheckbox,
    MaterialButton,
    SignUpUserForm,
    SignUpOrgForm,
  },
  data() {
    return {
      step: 1,
      userId: '',
      userPw: '',
      pwCheck: '',
      agree: false,
      idChecked: false, // 중복 확인 여부
      idAvailable: false, // ← 사용 가능 여부
    };
  },
  watch: {
    userId() {
      this.idChecked = false;
      this.idAvailable = false;
    },
  },
  beforeMount() {
    this.toggleEveryDisplay();
    this.toggleHideConfig();
    body.classList.remove('bg-gray-100');
  },
  beforeUnmount() {
    this.toggleEveryDisplay();
    this.toggleHideConfig();
    body.classList.add('bg-gray-100');
  },
  methods: {
    ...mapMutations(['toggleEveryDisplay', 'toggleHideConfig']),

    // 중복확인
    async checkId() {
      if (!this.userId) {
        alert('입력된 아이디가 없음');
        return;
      }
      try {
        const result = await checkUserId(this.userId);
        this.idChecked = true;
        // ok -> 사용 가능한지 체크
        if (result.ok) {
          this.idAvailable = true;
          alert('사용 가능');
        } else {
          this.idAvailable = false;
          alert('이미 사용중인 아이디');
        }
      } catch (err) {
        alert('중복확인 오류');
      }
    },

    goToStep(type) {
      // 중복확인 검사
      if (!this.idChecked) {
        return alert('아이디 중복확인 ㄱㄱ');
      }
      if (!this.idAvailable) {
        return alert('사용할 수 없는 아이디');
      }
      if (!this.userId || !this.userPw) {
        return alert('입력된 아이디와 비밀번호가 없음.');
      }
      if (this.userPw !== this.pwCheck) {
        return alert('비밀번호가 불일치.');
      }
      if (!this.agree) {
        return alert('이용약관 동의 ㄱㄱ');
      }

      alert('다음 페이지로 이동합니다');
      this.step = type; // user / org
    },

    async signUpSubmit(type, detail) {
      // 개인 회원
      if (type == 'user') {
        try {
          const payload = {
            userId: this.userId,
            userPw: this.userPw,
            agree: this.agree,
            joinDate: today,
            ...detail,
          };
          const result = await addUser(payload);

          if (result.ok) {
            alert('회원가입 성공. 로그인 페이지로 이동');
            this.$router.push({ name: 'SignIn' });
          } else {
            alert('회원가입 실패 : ', result.message);
          }
        } catch (err) {
          alert('회원가입 오류 발생');
        }
      }
      // 기관 회원
      if (type == 'org') {
        try {
          const payload = {
            userId: this.userId,
            userPw: this.userPw,
            agree: this.agree,
            joinDate: today,
            ...detail,
          };

          console.log(payload);
          const result = await addOrg(payload);

          if (result.ok) {
            alert('회원가입 성공. 로그인 페이지로 이동');
            // this.$router.push({ name: 'SignIn' });
          } else {
            alert('기관 회원가입 실패: ' + result.message);
          }
        } catch (err) {
          alert('기관 회원가입 중 오류 발생');
        }
      }
    },
  },
};
</script>
