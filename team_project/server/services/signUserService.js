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
async function addOrg(userData) {
  try {
    // 기관명 조회 -> code 가져옴
    const orgCode = await signUserMapper.findOrgCode(userData.org_name);
    if (!orgCode) {
      return { ok: false, message: '등록된 기관 없음' };
    }

    // 회원가입
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

async function searchOrg(name) {
  try {
    const list = await signUserMapper.searchOrgByName(name);
    return { ok: true, list };
  } catch (err) {
    console.error('[ searchOrg Service 오류 ]', err);
    throw err;
  }
}

module.exports = { checkId, addUser, addOrg, searchOrg };
