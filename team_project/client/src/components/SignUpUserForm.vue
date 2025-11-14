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
        @input="regFront = regFront.replace(/[^0-9]/g, '').slice(0, 6)"
        size="lg"
        class="flex-grow-1"
      />
      <material-input
        id="reg2"
        type="password"
        label="주민등록번호 뒷자리"
        v-model="regBack"
        @input="regBack = regBack.replace(/[^0-9]/g, '').slice(0, 7)"
        size="lg"
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
      @input="validatePhone"
    />

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

    <!-- 소속 기관 코드 입력 -->
    <div class="field">
      <material-input
        id="orgCode"
        type="number"
        label="소속 기관코드 (선택사항)"
        v-model="org_code"
      />
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
      org_code: '',
      role: 'AA1',
      emailSent: false, // 이메일 인증 여부(현재 미구현)
    };
  },
  methods: {
    searchAddress() {
      alert('주소 검색 기능 준비 중');
    },
    sendVerification() {
      if (!this.email) {
        return alert('이메일을 입력하세요.');
      }

      this.emailSent = true;
      alert('인증번호가 발송되었습니다.');
    },
    verifyEmail() {
      if (!this.verifyCode) {
        return alert('인증번호를 입력하세요.');
      }
      alert('이메일 인증이 완료되었습니다.');
    },
    submitForm() {
      if (
        !this.name ||
        !this.regFront ||
        !this.regBack ||
        !this.phone ||
        !this.address ||
        !this.email
      ) {
        return alert('필수 정보를 입력하세요.');
      }

      let formattedPhone = '';
      if (this.phone.length === 10) {
        formattedPhone = `${this.phone.slice(0, 3)}-${this.phone.slice(
          3,
          6
        )}-${this.phone.slice(6)}`;
      } else if (this.phone.length === 11) {
        formattedPhone = `${this.phone.slice(0, 3)}-${this.phone.slice(
          3,
          7
        )}-${this.phone.slice(7)}`;
      } else {
        return alert('전화번호는 10~11자리 숫자로 입력하세요.');
      }

      this.$emit('submit', {
        name: this.name,
        ssn: `${this.regFront}-${this.regBack}`,
        phone: formattedPhone,
        address: this.address,
        email: this.email,
        role: this.role,
        org_code: this.org_code ? Number(this.org_code) : null,
      });
    },
    validatePhone() {
      // 하이픈 감지
      if (this.phone.includes('-')) {
        alert('- 없이 입력하세요.');
        this.phone = this.phone.replace(/-/g, '');
        return;
      }

      // 숫자만
      this.phone = this.phone.replace(/[^0-9]/g, '');

      // 11자리 제한
      if (this.phone.length > 11) {
        this.phone = this.phone.slice(0, 11);
      }
    },
  },
};
</script>
