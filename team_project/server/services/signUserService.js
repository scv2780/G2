const signUserMapper = require('../mappers/signUserMapper');

// 전체 목록 조회 test
async function checkId(id) {
  const result = await signUserMapper.findUserId(id);
  return result;
}

// 개인 회원
async function addUser(userData) {
  const result = await signUserMapper.addUser(userData);
  return result;
}

// 기관 회원
// 헷갈릴까봐 작동 순서 주석 달아둠
// 1. 프론트에서 회원가입 완료를 진행 -> /api/user/addOrg으로 이동
// 2. findOrgCode 실행
//    -> 회원가입 시 작성한 기관명(userData.org_name)으로 기관 코드(orgCode)를 찾음
// 3. 기관 코드가 없으면 ok: false 반환
// 4. 기관 코드가 있으면 매퍼에 있는 addOrg를 실행하여 DB 기입
async function addOrg(userData) {
  try {
    // 기관명 조회 -> orgCode 가져옴
    const orgCode = await signUserMapper.findOrgCode(userData.org_name);
    if (!orgCode) {
      return { ok: false, message: '등록된 기관 없음' };
    }
    // 기관 코드가 있으면 회원가입 진행 ㄱㄱ
    const result = await signUserMapper.addOrg({
      ...userData,
      org_code: orgCode,
    });
    return result;
  } catch (err) {
    console.error('[ addOrg 오류 ] : ', err);
    throw err;
  }
}

// 로그인
async function login(data) {
  try {
    const result = await signUserMapper.authLogin(data);
    return result;
  } catch (err) {
    console.error('[ login Service 오류 ]', err);
    throw err;
  }
}

module.exports = { checkId, addUser, addOrg, login };
