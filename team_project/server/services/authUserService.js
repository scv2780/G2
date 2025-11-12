const authUserMapper = require('../mappers/authUserMapper');

// 전체 목록 조회 test
async function checkId(id) {
  const result = await authUserMapper.findUserId(id);
  return result;
}

module.exports = { checkId };
