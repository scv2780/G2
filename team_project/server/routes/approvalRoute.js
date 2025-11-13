const express = require("express");
const router = express.Router();
const approvalService = require("../services/approvalService");

// GET /approvals
router.get("/", async (req, res) => {
  try {
    const state = req.query.state || "";
    const keyword = req.query.keyword || "";
    const page = parseInt(req.query.page || "1", 10);
    const size = parseInt(req.query.size || "20", 10);

    const list = await approvalService.managerApprovalList({
      state,
      keyword,
      page,
      size,
    });

    return res.status(200).json({
      status: "success",
      data: list,
    });
  } catch (err) {
    console.error("[GET /approvals] 실패:", err.stack || err);
    return res.status(500).json({
      status: "error",
      message: err.message || "서버 오류 (approvals)",
    });
  }
});

/** ✅ 승인 처리: PUT /approvals/:code/approve */
router.put("/:code/approve", async (req, res) => {
  try {
    const approvalCode = req.params.code;
    const result = await approvalService.approve({ approvalCode });

    if (!result.affectedRows) {
      return res.status(400).json({
        status: "fail",
        message:
          "변경된 행이 없습니다. (이미 처리되었거나 존재하지 않는 승인코드)",
      });
    }

    return res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.error("[PUT /approvals/:code/approve] 실패:", err.stack || err);
    return res.status(500).json({
      status: "error",
      message: err.message || "승인 처리 중 오류",
    });
  }
});

// ✅ 반려 처리: PUT /approvals/:code/reject
router.put("/:code/reject", async (req, res) => {
  try {
    const approvalCode = req.params.code;
    const { reason } = req.body || {};

    const result = await approvalService.reject({ approvalCode, reason });

    if (!result.affectedRows) {
      return res.status(400).json({
        status: "fail",
        message:
          "변경된 행이 없습니다. (이미 처리되었거나 존재하지 않는 승인코드)",
      });
    }

    return res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.error("[PUT /approvals/:code/reject] 실패:", err.stack || err);
    return res.status(500).json({
      status: "error",
      message: err.message || "반려 처리 중 오류",
    });
  }
});

// ✅ 기관 담당자 승인/요청 목록 (AE2)
router.get("/staff", async (req, res) => {
  try {
    const state = req.query.state || "";
    const keyword = req.query.keyword || "";
    const page = parseInt(req.query.page || "1", 10);
    const size = parseInt(req.query.size || "20", 10);

    const list = await approvalService.staffApprovalList({
      state,
      keyword,
      page,
      size,
    });

    return res.status(200).json({
      status: "success",
      data: list,
    });
  } catch (err) {
    console.error("[GET /approvals/staff] 실패:", err.stack || err);
    return res.status(500).json({
      status: "error",
      message: err.message || "서버 오류 (approvals/staff)",
    });
  }
});

// ✅ 기관 담당자 승인 (BA2 + role AA2)
router.put("/staff/:code/approve", async (req, res) => {
  try {
    const approvalCode = req.params.code;
    const result = await approvalService.approveStaff({ approvalCode });

    if (!result.affectedRows) {
      return res.status(400).json({
        status: "fail",
        message:
          "변경된 행이 없습니다. (이미 처리되었거나 존재하지 않는 승인코드)",
      });
    }

    return res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.error(
      "[PUT /approvals/staff/:code/approve] 실패:",
      err.stack || err
    );
    return res.status(500).json({
      status: "error",
      message: err.message || "기관 담당자 승인 처리 중 오류",
    });
  }
});

// ✅ 기관 담당자 반려 (BA3)
router.put("/staff/:code/reject", async (req, res) => {
  try {
    const approvalCode = req.params.code;
    const { reason } = req.body || {};

    const result = await approvalService.rejectStaff({
      approvalCode,
      reason,
    });

    if (!result.affectedRows) {
      return res.status(400).json({
        status: "fail",
        message:
          "변경된 행이 없습니다. (이미 처리되었거나 존재하지 않는 승인코드)",
      });
    }

    return res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.error(
      "[PUT /approvals/staff/:code/reject] 실패:",
      err.stack || err
    );
    return res.status(500).json({
      status: "error",
      message: err.message || "기관 담당자 반려 처리 중 오류",
    });
  }
});

module.exports = router;
