const express = require("express");
const router = express.Router();
const surveyService = require("../services/surveyService");

// 목록 (기존)
router.get("/", async (req, res, next) => {
  try {
    const rows = await surveyService.listTemplates();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// ✅ 최신 조사지(트리) 조회
router.get("/latest", async (req, res, next) => {
  try {
    const data = await surveyService.getLatestSurvey();
    res.json(data); // 이미 옵션 JSON 파싱됨
  } catch (e) {
    next(e);
  }
});

// ✅ 응답 제출
router.post("/submit", async (req, res, next) => {
  try {
    const result = await surveyService.submitSurvey(req.body);
    res.json({ success: true, result });
  } catch (e) {
    next(e);
  }
});

// ✅ 새 조사지 생성 (기존)
router.post("/new", async (req, res, next) => {
  try {
    const result = await surveyService.createSurvey(req.body);

    // BigInt 응답 보호 (혹시 모를 BigInt -> Number)
    const safe = JSON.parse(JSON.stringify(result, (_, v) => (typeof v === "bigint" ? Number(v) : v)));
    res.json({ success: true, result: safe });
  } catch (e) {
    console.error("[surveyRoute POST /new]", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
