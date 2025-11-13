// server/services/counselService.js
const counselMapper = require("../mappers/counselMapper");

module.exports = {
  /**
   * 역할별 상담 목록 조회
   * role: 2 = 담당자, 3 = 관리자, 4 = 시스템
   */
  listCounsel(role, userId) {
    return counselMapper.listCounselByRole(Number(role), Number(userId));
  },

  // 상담 작성
  async saveCounsel(body) {
    return counselMapper.saveCounsel(body);
  },

  //상담 상세
  async getCounselDetail(submitCode) {
    return counselMapper.getCounselDetail(submitCode);
  },

  async approveCounsel(submitCode) {
    return await counselMapper.approveCounsel(submitCode);
  },

  async rejectCounsel(submitCode, reason) {
    return await counselMapper.rejectCounsel(submitCode, reason);
  },
};
