import { defineStore } from 'pinia';
import { login as loginApi } from '../api/user';

export const useAuthStore = defineStore('authLogin', {
  state: () => ({
    userId: '',
    role: '',
    isLogin: false,
  }),
  getters: {
    isAA1: (state) => state.role == 'AA1',
    isAA2: (state) => state.role == 'AA2',
    isAA3: (state) => state.role == 'AA3',
  },
  actions: {
    reload() {
      // 헷갈릴까봐 주석 설명
      // 페이지 시작 시 reload 동작
      // localStorage에 값이 있으면 loginCheck -> true
      // loginCheck을 JSON으로 변환시켜 줌 -> loginData
      // loginData를 기반으로 pinia 객체에 값을 저장
      // 로그인 상태가 아닐 경우 생략
      // -> 새로고침해도 로그인 유지됨
      const loginCheck = localStorage.getItem('user');
      if (!loginCheck) {
        return;
      }

      try {
        const loginData = JSON.parse(loginCheck);
        this.userId = loginData.userId;
        this.role = loginData.role;
        this.isLogin = true;
      } catch (err) {
        console.error('[ pinia reload 오류 ] : ', err);
      }
    },

    // 로그인
    async login({ userId, userPw }) {
      const result = await loginApi({ userId, userPw });

      // 아이디, 패스워드 오기입 시 false가 되어 SignIn.vue에서 에러 발생시킴
      if (!result.ok) {
        throw new Error(result.message);
      }

      this.userId = result.user_id;
      this.role = result.role;
      this.isLogin = true;

      localStorage.setItem(
        'user',
        JSON.stringify({
          userId: result.user_Id,
          role: result.role,
        })
      );
      return result;
    },

    // 로그아웃
    logout() {
      this.userId = '';
      this.role = '';
      this.isLogin = false;
      localStorage.removeItem('user');
    },
  },
});
