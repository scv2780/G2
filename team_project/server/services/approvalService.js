// team_project/server/services/approvalService.js
const approvalMapper = require("../mappers/approvalMapper.js");

// 관리자 승인 요청 목록
async function managerApprovalList() {
  return await approvalMapper.managerApprovalList();
}

module.exports = {
  managerApprovalList,
};
