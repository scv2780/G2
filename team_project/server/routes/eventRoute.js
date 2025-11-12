// eventRoute.js
const express = require("express");
const router = express.Router();
const eventService = require("../services/eventService");

// ==========================
// 이벤트 전체 목록 조회
// GET /event
// ==========================
router.get("/", async (req, res) => {
  try {
    const events = await eventService.getEventList();
    res.status(200).json({
      status: "success",
      data: events,
    });
  } catch (err) {
    console.error("[eventRoute.js || 이벤트 전체조회 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "이벤트 전체조회 중 에러 발생",
    });
  }
});

// ==========================
// 이벤트 단건 조회
// GET /event/:event_code
// ==========================
router.get("/:event_code", async (req, res) => {
  try {
    const event = await eventService.getEvent(req.params.event_code);
    res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (err) {
    console.error("[eventRoute.js || 이벤트 단건조회 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "이벤트 단건조회 중 에러 발생",
    });
  }
});

// ==========================
// 이벤트 등록
// POST /event
// ==========================
router.post("/", async (req, res) => {
  try {
    const newEvent = await eventService.createEvent(req.body);
    res.status(201).json({
      status: "success",
      data: newEvent,
    });
  } catch (err) {
    console.error("[eventRoute.js || 이벤트 등록 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "이벤트 등록 중 에러 발생",
    });
  }
});

// ==========================
// 이벤트 수정
// PUT /event/:event_code
// ==========================
router.put("/:event_code", async (req, res) => {
  try {
    const updatedEvent = await eventService.modifyEvent(
      req.body,
      req.params.event_code
    );
    res.status(200).json({
      status: "success",
      data: updatedEvent,
    });
  } catch (err) {
    console.error("[eventRoute.js || 이벤트 수정 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "이벤트 수정 중 에러 발생",
    });
  }
});

// ==========================
// 이벤트 삭제
// DELETE /event/:event_code
// ==========================
router.delete("/:event_code", async (req, res) => {
  try {
    const deletedEvent = await eventService.removeEvent(req.params.event_code);
    res.status(200).json({
      status: "success",
      data: deletedEvent,
    });
  } catch (err) {
    console.error("[eventRoute.js || 이벤트 삭제 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "이벤트 삭제 중 에러 발생",
    });
  }
});

module.exports = router;
