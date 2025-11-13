// eventRoute.js
const express = require("express");
const router = express.Router();
const eventService = require("../services/eventService");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 업로드 경로와 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 한글 지원
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );

    // 날짜 접미사 (yyyyMMdd)
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);
    const dateSuffix = `${year}${month}${day}`;

    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    cb(null, `${baseName}_${dateSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// ==========================
// 이벤트 메인페이지
// GET /event
// ==========================
router.get("/", async (req, res) => {
  try {
    const events = await eventService.getEventMainpage();
    res.status(200).json({
      status: "success",
      data: events,
    });
  } catch (err) {
    console.error(
      "[eventRoute.js || 이벤트 메인페이지 목록 조회 실패]",
      err.message
    );
    res.status(500).json({
      status: "error",
      message: "이벤트 메인페이지 목록 조회 중 에러 발생",
    });
  }
});

// ==========================
// 이벤트 목록 조회
// GET /event
// ==========================
router.get("/list", async (req, res) => {
  try {
    // 쿼리스트링에서 검색 조건 받기
    const filters = {
      recruit_status: req.query.recruit_status || null,
      recruit_start_date: req.query.recruit_start_date || null,
      recruit_end_date: req.query.recruit_end_date || null,
      event_start_date: req.query.event_start_date || null,
      event_end_date: req.query.event_end_date || null,
      event_name: req.query.event_name || null,
    };

    const events = await eventService.getEventList(filters);

    res.status(200).json({
      status: "success",
      data: events,
    });
  } catch (err) {
    console.error("[eventRoute.js || 이벤트 목록 조회 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "이벤트 목록 조회 중 에러 발생",
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
// 이벤트 + 첨부파일 등록
// POST /event
// ==========================
router.post("/", upload.array("attachments"), async (req, res) => {
  try {
    // JSON 문자열을 객체로 변환
    const eventInfo = JSON.parse(req.body.eventInfo);
    const subManagers = req.body.sub_managers
      ? JSON.parse(req.body.sub_managers)
      : [];

    // 첨부파일 정보
    const attachments = req.files.map((file) => ({
      original_filename: Buffer.from(file.originalname, "latin1").toString(
        "utf8"
      ),
      server_filename: file.filename,
      file_path: `/uploads/${file.filename}`,
    }));

    // DB에 저장할 통합 객체
    const newEvent = {
      ...eventInfo,
      sub_managers: subManagers,
      attachments,
    };

    // DB 서비스 호출
    const savedEvent = await eventService.createEventFull(newEvent);

    res.status(201).json({ status: "success", data: savedEvent });
  } catch (err) {
    console.error("[eventRoute.js || 이벤트 등록 실패]", err.message);
    res
      .status(500)
      .json({ status: "error", message: "이벤트 등록 중 에러 발생" });
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
    const deletedSubEvent = await eventService.removeSubEvent(
      req.params.sub_event_code
    );
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
