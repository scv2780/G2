// server/routes/counselRoute.js
const express = require("express");
const router = express.Router();
const counselService = require("../services/counselService");

// BigInt → Number (JSON 직렬화 보호용)
const toSafeJson = (obj) =>
  JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );

/**
 * 상담 목록 조회
 * GET /counsel?role=2&userId=2
 */
router.get("/", async (req, res) => {
  try {
    const role = Number(req.query.role || 2);
    const userId = Number(req.query.userId || 1);

    const rows = await counselService.listCounsel(role, userId);

    res.json({ success: true, result: toSafeJson(rows) });
  } catch (e) {
    console.error("[GET /counsel]", e);
    res.status(500).json({
      success: false,
      message: e.message || "상담 목록 조회 중 오류",
    });
  }
});

// 상담 저장
router.post("/new", async (req, res) => {
  try {
    const result = await counselService.saveCounsel(req.body);
    res.json({ success: true, result });
  } catch (e) {
    console.error("[POST /counsel/new]", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/:submitCode", async (req, res) => {
  try {
    const submitCode = Number(req.params.submitCode);
    const result = await counselService.getCounselDetail(submitCode);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "상담 정보를 찾을 수 없습니다." });
    }

    res.json({ success: true, result });
  } catch (e) {
    console.error("[GET /counsel/:submitCode]", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// 상담 승인
router.post("/:submitCode/approve", async (req, res) => {
  try {
    const submitCode = Number(req.params.submitCode);
    const result = await counselService.approveCounsel(submitCode);

    res.json({ success: true, result });
  } catch (e) {
    console.error("[POST /counsel/:submitCode/approve]", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// 상담 반려
router.post("/:submitCode/reject", async (req, res) => {
  try {
    const submitCode = Number(req.params.submitCode);
    const { reason } = req.body;

    const result = await counselService.rejectCounsel(submitCode, reason);

    res.json({ success: true, result });
  } catch (e) {
    console.error("[POST /counsel/:submitCode/reject]", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
