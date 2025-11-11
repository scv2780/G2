const schMapper = require("../mappers/schMapper");

// 기관 목록 조회
async function schService() {
  const testFindDB = await schMapper.organizationList();
  return testFindDB;
}

module.exports = { schService };
