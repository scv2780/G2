const pool = require('../configs/db');
const signUserSQL = require('../sql/signUserSQL');

// 중복 확인
async function findUserId(id) {
  try {
    const rows = await pool.query(signUserSQL.FIND_ID, [id]);
    if (rows.length > 0) {
      return { ok: false, message: '이미 사용중인 아이디입니다.' };
    }
    return { ok: true, message: '사용 가능한 아이디입니다.' };
  } catch (err) {
    console.error('[ findUserId 실패 ] : ', err);
    throw err;
  }
}

// 개인 회원가입
async function addUser(data) {
  try {
    const userData = [
      data.org_code || null,
      data.userId,
      data.userPw,
      data.role,
      data.name,
      data.ssn,
      data.phone,
      data.address,
      data.email,
      1, // is_active(승인 여부)
      0, // 로그인 실패 횟수
      data.joinDate, // 가입일
    ];

    await pool.query(signUserSQL.INSERT_USER, userData);

    return { ok: true, message: '회원가입 완료' };
  } catch (err) {
    console.error('[ addUser 실패 ] : ', err);
    throw err;
  }
}

// 기관 code 가져오기
async function findOrgCode(orgName) {
  try {
    const rows = await pool.query(signUserSQL.FIND_ORG_CODE, [orgName]);
    if (rows.length == 0) {
      return null;
    }
    return rows[0].org_code;
  } catch (err) {
    console.error('[ findOrgCode 찾기 실패 ] : ', err);
    throw err;
  }
}

// 기관 회원가입
async function addOrg(data) {
  try {
    const userData = [
      data.org_code,
      data.userId,
      data.userPw,
      data.role,
      data.name,
      data.ssn,
      data.phone,
      data.address,
      data.email,
      data.department,
      1, // is_active(승인 여부)
      0, // 로그인 실패 횟수
      data.joinDate, // 가입일
    ];

    await pool.query(signUserSQL.INSERT_USER, userData);

    return { ok: true, message: '기관 회원가입 완료' };
  } catch (err) {
    console.error('[ insertOrgUser 실패 ]', err);
    throw err;
  }
}

// 로그인
async function authLogin(data) {
  try {
    const result = await pool.query(signUserSQL.AUTH_LOGIN, [
      data.userId,
      data.userPw,
    ]);
    if (result.length == 0) {
      console.log('값 없음');
      return { ok: false, message: '로그인 실패' };
    }
    return { ok: true, message: '로그인 성공', ...result[0] };
  } catch (err) {
    console.error('[ authLogin 실패 ]', err);
    throw err;
  }
}

module.exports = {
  findUserId,
  addUser,
  findOrgCode,
  addOrg,
  authLogin,
};
