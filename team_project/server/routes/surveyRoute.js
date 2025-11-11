const express = require("express");
const router = express.Router();
const surveyService = require("../services/survey_service.js");

//조회
router.get("/", async (req, res, next) => {
  try {
    const list = await surveyService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
