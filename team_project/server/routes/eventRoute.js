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

// ==========================
// 세부 이벤트 전체 목록 조회
// GET /event/sub
// ==========================
router.get("/sub", async (req, res) => {
  try {
    const subEvents = await eventService.getSubEventList();
    res.status(200).json({
      status: "success",
      data: subEvents,
    });
  } catch (err) {
    console.error("[eventRoute.js || 세부 이벤트 전체조회 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "세부 이벤트 전체조회 중 에러 발생",
    });
  }
});

// ==========================
// 세부 이벤트 단건 조회
// GET /event/sub/:sub_event_code
// ==========================
router.get("/sub/:sub_event_code", async (req, res) => {
  try {
    const subEvent = await eventService.getSubEvent(req.params.sub_event_code);
    res.status(200).json({
      status: "success",
      data: subEvent,
    });
  } catch (err) {
    console.error("[eventRoute.js || 세부 이벤트 단건조회 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "세부 이벤트 단건조회 중 에러 발생",
    });
  }
});

// ==========================
// 세부 이벤트 등록
// POST /event/sub
// ==========================
router.post("/sub", async (req, res) => {
  try {
    const newSubEvent = await eventService.createSubEvent(req.body);
    res.status(201).json({
      status: "success",
      data: newSubEvent,
    });
  } catch (err) {
    console.error("[eventRoute.js || 세부 이벤트 등록 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "세부 이벤트 등록 중 에러 발생",
    });
  }
});

// ==========================
// 세부 이벤트 수정
// PUT /event/sub/:sub_event_code
// ==========================
router.put("/sub/:sub_event_code", async (req, res) => {
  try {
    const updatedSubEvent = await eventService.modifySubEvent(
      req.body,
      req.params.sub_event_code
    );
    res.status(200).json({
      status: "success",
      data: updatedSubEvent,
    });
  } catch (err) {
    console.error("[eventRoute.js || 세부 이벤트 수정 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "세부 이벤트 수정 중 에러 발생",
    });
  }
});

// ==========================
// 세부 이벤트 삭제
// DELETE /event/sub/:sub_event_code
// ==========================
router.delete("/sub/:sub_event_code", async (req, res) => {
  try {
    const deletedSubEvent = await eventService.removeSubEvent(req.params.sub_event_code);
    res.status(200).json({
      status: "success",
      data: deletedSubEvent,
    });
  } catch (err) {
    console.error("[eventRoute.js || 세부 이벤트 삭제 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "세부 이벤트 삭제 중 에러 발생",
    });
  }
});

module.exports = router;
