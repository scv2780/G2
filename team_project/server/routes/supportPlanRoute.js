// server/routes/supportPlanRoute.js
const express = require("express");
const router = express.Router();
const supportPlanService = require("../services/supportPlanService");

const toSafeJson = (obj) =>
  JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );

router.get("/", async (req, res) => {
  try {
    const role = Number(req.query.role || 2);
    const userId = Number(req.query.userId || 1); // TODO: 로그인 세션에서 가져오도록 변경 가능

    const result = await supportPlanService.listPlans(role, userId);

    res.json({ success: true, result: toSafeJson(result) });
  } catch (e) {
    console.error("[GET /plans]", e);
    res.status(500).json({
      success: false,
      message: e.message || "지원계획 목록 조회 중 오류",
    });
  }
});

module.exports = router;
