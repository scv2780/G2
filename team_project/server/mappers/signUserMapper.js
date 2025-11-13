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
    const values = [
      data.org_code || null,
      data.userId,
      data.userPw,
      'USER', // 개인 or 기관
      data.name,
      data.ssn,
      data.phone,
      data.address,
      data.email,
      1, // is_active(승인 여부)
      0, // 로그인 실패 횟수
      data.joinDate, // 가입일
    ];

    await pool.query(signUserSQL.INSERT_USER, values);

    return { ok: true, message: '회원가입 완료' };
  } catch (err) {
    console.error('[ addUser 실패 ] : ', err);
    throw err;
  }
}

// 기관 code 가져오기
async function findOrgCode(orgName) {
  try {
    const [rows] = await pool.query(signUserSQL.FIND_ORG_CODE, [orgName]);
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
    const values = [
      data.org_code,
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

    await pool.query(signUserSQL.INSERT_USER, values);

    return { ok: true, message: '기관 회원가입 완료' };
  } catch (err) {
    console.error('[ insertOrgUser 실패 ]', err);
    throw err;
  }
}

async function searchOrgByName(keyword) {
  try {
    const [rows] = await pool.query(signUserSQL.SEARCH_ORG, [keyword]);
    return rows; // ex: [{ org_name: '행복센터' }, ...]
  } catch (err) {
    console.error('[ searchOrgByName 실패 ]', err);
    throw err;
  }
}

module.exports = { findUserId, addUser, findOrgCode, addOrg, searchOrgByName };
