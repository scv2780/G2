// team_project/server/routes/approvalRoute.js

const express = require("express");
const router = express.Router();
const approvalService = require("../services/approvalService.js");

// 관리자 승인 요청 목록
router.get("/manager-approvals", async (req, res) => {
  try {
    const rows = await approvalService.managerApprovalList();
    console.log("[GET /api/approvals/manager-approvals] count:", rows.length);
    return res.status(200).json({ status: "success", data: rows });
  } catch (err) {
    console.error(
      "[GET /api/approvals/manager-approvals] 실패:",
      err.stack || err
    );
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
});

module.exports = router;
