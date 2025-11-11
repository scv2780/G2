const sponsorMapper = require("../mappers/sponsorMapper.js");

// 전체 목록 조회 test
async function sponsorUsersList() {
  const sponsorFindDB = await sponsorMapper.sponsorSQL();
  return sponsorFindDB;
}

module.exports = { sponsorUsersList };
