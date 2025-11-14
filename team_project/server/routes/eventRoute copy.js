// eventRoute.js
const express = require("express");
const router = express.Router();
const eventService = require("../services/eventService");

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
// 이벤트 등록
// POST /event
// ==========================
router.post("/", async (req, res) => {
  try {
    let eventInfo = {};
    let subManagers = [];
    try {
      eventInfo = req.body.eventInfo
        ? JSON.parse(req.body.eventInfo)
        : req.body;
      subManagers = req.body.sub_managers
        ? JSON.parse(req.body.sub_managers)
        : [];
    } catch (err) {
      return res
        .status(400)
        .json({ status: "error", message: "잘못된 JSON 형식" });
    }
    const newEvent = {
      ...eventInfo,
      sub_managers: subManagers,
    };

    const savedEvent = await eventService.createEventFull(newEvent);

    res.status(201).json({ status: "success", data: savedEvent });
  } catch (err) {
    console.error("[eventRoute.js || 이벤트 등록 실패]", err.message);
    res
      .status(500)
      .json({ status: "error", message: "이벤트 등록 중 에러 발생" });
  }
});

// router.post("/", async (req, res) => {
//   try {
//     // JSON 문자열을 객체로 변환
//     const eventInfo = JSON.parse(req.body.eventInfo);
//     const subManagers = req.body.sub_managers
//       ? JSON.parse(req.body.sub_managers)
//       : [];

//     // 첨부파일 정보
//     const attachments = req.files.map((file) => ({
//       original_filename: Buffer.from(file.originalname, "latin1").toString(
//         "utf8"
//       ),
//       server_filename: file.filename,
//       file_path: `/uploads/${file.filename}`,
//     }));

//     // DB에 저장할 통합 객체
//     const newEvent = {
//       ...eventInfo,
//       sub_managers: subManagers,
//       attachments,
//     };

//     // DB 서비스 호출
//     const savedEvent = await eventService.createEventFull(newEvent);

//     res.status(201).json({ status: "success", data: savedEvent });
//   } catch (err) {
//     console.error("[eventRoute.js || 이벤트 등록 실패]", err.message);
//     res
//       .status(500)
//       .json({ status: "error", message: "이벤트 등록 중 에러 발생" });
//   }
// });

// ==========================
// 첨부파일 등록 (별도 API)
// POST /event/:event_code/attachments
// ==========================
router.post(
  "/:event_code/attachments",
  upload.array("attachments"),
  async (req, res) => {
    try {
      const event_code = req.params.event_code;

      const attachments = req.files.map((file) => ({
        original_filename: Buffer.from(file.originalname, "latin1").toString(
          "utf8"
        ),
        server_filename: file.filename,
        file_path: `/uploads/${file.filename}`,
        linked_table_name: "event",
        linked_record_pk: event_code,
      }));

      // attachmentService.createAttachment 호출
      const savedAttachments = await Promise.all(
        attachments.map((file) => attachmentService.createAttachment(file))
      );

      res.status(201).json({ status: "success", data: savedAttachments });
    } catch (err) {
      console.error("[eventRoute.js || 첨부파일 등록 실패]", err.message);
      res.status(500).json({
        status: "error",
        message: "첨부파일 등록 중 에러 발생",
      });
    }
  }
);

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
