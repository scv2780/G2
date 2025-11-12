<template>
  <div>
    <h5 class="font-weight-bolder mb-4">개인 회원 상세 정보</h5>

    <!-- 이름 -->
    <material-input
      id="name"
      type="text"
      label="이름"
      v-model="name"
      size="lg"
      class="mb-3"
    />

    <!-- 주민등록번호 (앞자리 + 뒷자리) -->
    <div class="d-flex align-items-end gap-2 mb-3">
      <material-input
        id="reg1"
        type="text"
        label="주민등록번호 앞자리"
        v-model="regFront"
        size="lg"
        maxlength="6"
        class="flex-grow-1"
      />
      <material-input
        id="reg2"
        type="password"
        label="주민등록번호 뒷자리"
        v-model="regBack"
        size="lg"
        maxlength="7"
        class="flex-grow-1"
      />
    </div>

    <!-- 연락처 -->
    <material-input
      id="phone"
      type="text"
      label="연락처 ( - 없이 입력 )"
      v-model="phone"
      size="lg"
      class="mb-3"
    />

    <!-- 주소 -->
    <div class="d-flex align-items-end gap-2 mb-3">
      <material-input
        id="address"
        type="text"
        label="주소"
        v-model="address"
        size="lg"
        class="flex-grow-1"
      />
      <material-button
        variant="gradient"
        color="success"
        size="md"
        type="button"
        class="py-2 px-3"
        @click="searchAddress"
      >
        주소검색
      </material-button>
    </div>

    <!-- 이메일 -->
    <div class="d-flex align-items-end gap-2 mb-3">
      <material-input
        id="email"
        type="email"
        label="이메일"
        v-model="email"
        size="lg"
        class="flex-grow-1"
      />
      <material-button
        variant="gradient"
        color="success"
        size="md"
        type="button"
        class="py-2 px-3"
        @click="sendVerification"
      >
        인증
      </material-button>
    </div>

    <!-- 이메일 인증번호 입력칸 -->
    <div class="d-flex align-items-end gap-2 mb-4" v-if="emailSent">
      <material-input
        id="email-code"
        type="text"
        label="인증번호 입력"
        v-model="verifyCode"
        size="lg"
        class="flex-grow-1"
      />
      <material-button
        variant="gradient"
        color="success"
        size="md"
        type="button"
        class="py-2 px-3"
        @click="verifyEmail"
      >
        인증 완료
      </material-button>
    </div>

    <!-- 하단 버튼 -->
    <div class="d-flex justify-content-between mt-4">
      <material-button type="button" @click="$emit('back')"
        >뒤로</material-button
      >
      <material-button type="button" color="success" @click="submitForm">
        회원가입 완료
      </material-button>
    </div>
  </div>
</template>

<script>
import MaterialInput from '@/components/MaterialInput.vue';
import MaterialButton from '@/components/MaterialButton.vue';

export default {
  name: 'SignUpUserForm',
  components: {
    MaterialInput,
    MaterialButton,
  },
  props: { base: Object },
  data() {
    return {
      name: '',
      regFront: '',
      regBack: '',
      phone: '',
      address: '',
      email: '',
      verifyCode: '',
      emailSent: false,
    };
  },
  methods: {
    searchAddress() {
      alert('주소 검색 기능 준비 중');
    },
    sendVerification() {
      if (!this.email) return alert('이메일을 입력하세요.');
      this.emailSent = true;
      alert('인증번호가 발송되었습니다.');
    },
    verifyEmail() {
      if (!this.verifyCode) return alert('인증번호를 입력하세요.');
      alert('이메일 인증이 완료되었습니다.');
    },
    submitForm() {
      if (!this.name || !this.regFront || !this.regBack)
        return alert('필수 정보를 입력하세요.');
      this.$emit('submit', {
        name: this.name,
        regNumber: `${this.regFront}-${this.regBack}`,
        phone: this.phone,
        address: this.address,
        email: this.email,
      });
    },
  },
};
</script>
