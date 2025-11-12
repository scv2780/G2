// server/routes/surveyRoute.js
const express = require("express");
const router = express.Router();
const surveyService = require("../services/surveyService");

// BigInt → Number (JSON 직렬화 보호)
const toSafeJson = (obj) =>
  JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );

/* -------------------------------
  버전 목록 (시스템)
--------------------------------*/
router.get("/", async (req, res) => {
  try {
    const rows = await surveyService.listTemplates();
    res.json({ success: true, result: toSafeJson(rows) });
  } catch (e) {
    console.error("[GET /survey]", e);
    res
      .status(500)
      .json({
        success: false,
        message: e.message || "조사지 목록 조회 중 오류",
      });
  }
});

/* -------------------------------
  최신 조사지 (일반 작성용)
--------------------------------*/
router.get("/latest", async (req, res) => {
  try {
    const data = await surveyService.getLatestSurvey();
    res.json({ success: true, result: toSafeJson(data) });
  } catch (e) {
    console.error("[GET /survey/latest]", e);
    res
      .status(500)
      .json({
        success: false,
        message: e.message || "최신 조사지 조회 중 오류",
      });
  }
});

/* -------------------------------
  조사지 제출 (일반)
--------------------------------*/
router.post("/submit", async (req, res) => {
  try {
    const result = await surveyService.submitSurvey(req.body);
    res.json({ success: true, result: toSafeJson(result) });
  } catch (e) {
    console.error("[POST /survey/submit]", e);
    res
      .status(500)
      .json({ success: false, message: e.message || "조사지 제출 중 오류" });
  }
});

/* -------------------------------
  조사지 추가 (시스템)
--------------------------------*/
router.post("/new", async (req, res) => {
  try {
    const result = await surveyService.createSurvey(req.body);
    res.json({ success: true, result: toSafeJson(result) });
  } catch (e) {
    console.error("[POST /survey/new]", e);
    res
      .status(500)
      .json({ success: false, message: e.message || "새 조사지 생성 중 오류" });
  }
});

/* -------------------------------
  조사지 수정 → 새 세부버전 생성 (시스템)
--------------------------------*/
router.post("/update/:templateCode", async (req, res) => {
  try {
    const result = await surveyService.updateSurveyVersion(
      req.params.templateCode,
      req.body
    );
    res.json({ success: true, result: toSafeJson(result) });
  } catch (e) {
    console.error("[POST /survey/update/:templateCode]", e);
    res
      .status(500)
      .json({ success: false, message: e.message || "조사지 수정 중 오류" });
  }
});

/* -------------------------------
  역할별 제출 목록
--------------------------------*/
router.get("/submissions", async (req, res) => {
  try {
    const role = Number(req.query.role || 1);
    const userId = Number(req.query.userId || 1);
    const rows = await surveyService.listSubmissions(role, userId);
    res.json({ success: true, result: toSafeJson(rows) });
  } catch (e) {
    console.error("[GET /survey/submissions]", e);
    res
      .status(500)
      .json({
        success: false,
        message: e.message || "제출본 목록 조회 중 오류",
      });
  }
});

/* -------------------------------
  제출본 상세
--------------------------------*/
router.get("/submission/:submitCode", async (req, res) => {
  try {
    const data = await surveyService.getSubmissionDetail(req.params.submitCode);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "제출본을 찾을 수 없습니다." });
    }
    res.json({ success: true, result: toSafeJson(data) });
  } catch (e) {
    console.error("[GET /survey/submission/:submitCode]", e);
    res
      .status(500)
      .json({
        success: false,
        message: e.message || "제출본 상세 조회 중 오류",
      });
  }
});

/* -------------------------------
  제출본 수정 (일반)
--------------------------------*/
router.put("/submission/:submitCode", async (req, res) => {
  try {
    const data = await surveyService.updateSubmission(
      req.params.submitCode,
      req.body
    );
    res.json({ success: true, result: toSafeJson(data) });
  } catch (e) {
    console.error("[PUT /survey/submission/:submitCode]", e);
    res
      .status(500)
      .json({ success: false, message: e.message || "제출본 수정 중 오류" });
  }
});


/* -------------------------------
  조사지 버전 상세 (세부버전 코드로 고정 조회)
--------------------------------*/
router.get("/detail/ver/:templateVerCode", async (req, res) => {
  try {
    const data = await surveyService.getSurveyDetailByVer(req.params.templateVerCode);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "해당 세부버전을 찾을 수 없습니다." });
    }
    res.json({ success: true, result: toSafeJson(data) });
  } catch (e) {
    console.error("[GET /survey/detail/ver/:templateVerCode]", e);
    res
      .status(500)
      .json({ success: false, message: e.message || "상세 조회 중 오류" });
  }
});

module.exports = router;
