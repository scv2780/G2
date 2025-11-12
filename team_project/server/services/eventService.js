// eventService.js
const eventMapper = require("../mappers/eventMapper");

// ==========================
// 이벤트 서비스
// ==========================

// ✅ 이벤트 전체 목록 조회
async function getEventList() {
  try {
    const events = await eventMapper.selectEventList();
    return events;
  } catch (err) {
    console.error("[eventService.js || 이벤트 전체조회 실패]", err.message);
    throw err;
  }
}

// ✅ 이벤트 단건 조회
async function getEvent(event_code) {
  try {
    const event = await eventMapper.selectEventOne(event_code);
    return event;
  } catch (err) {
    console.error("[eventService.js || 이벤트 단건조회 실패]", err.message);
    throw err;
  }
}

// 이벤트 + 세부 이벤트 등록
async function createEvent(data) {
  try {
    const result = await eventMapper.addEventWithSub(data);
    return result;
  } catch (err) {
    console.error("[eventService.js || 이벤트 등록 실패]", err.message);
    throw err;
  }
}

// 이벤트 + 세부 이벤트 수정
async function modifyEvent(data, event_code) {
  try {
    const result = await eventMapper.updateEventWithSub(data, event_code);
    return result;
  } catch (err) {
    console.error("[eventService.js || 이벤트 수정 실패]", err.message);
    throw err;
  }
}

// ✅ 이벤트 삭제
async function removeEvent(event_code) {
  try {
    const result = await eventMapper.deleteEvent(event_code);
    return result;
  } catch (err) {
    console.error("[eventService.js || 이벤트 삭제 실패]", err.message);
    throw err;
  }
}

// ==========================
// 세부 이벤트 서비스
// ==========================

// ✅ 세부 이벤트 전체 목록 조회
async function getSubEventList() {
  try {
    const subEvents = await eventMapper.selectSubEventList();
    return subEvents;
  } catch (err) {
    console.error(
      "[eventService.js || 세부 이벤트 전체조회 실패]",
      err.message
    );
    throw err;
  }
}

// ✅ 세부 이벤트 단건 조회
async function getSubEvent(sub_event_code) {
  try {
    const subEvent = await eventMapper.selectSubEventOne(sub_event_code);
    return subEvent;
  } catch (err) {
    console.error(
      "[eventService.js || 세부 이벤트 단건조회 실패]",
      err.message
    );
    throw err;
  }
}

// ✅ 세부 이벤트 등록
async function createSubEvent(data) {
  try {
    const result = await eventMapper.addSubEvent(data);
    return result;
  } catch (err) {
    console.error("[eventService.js || 세부 이벤트 등록 실패]", err.message);
    throw err;
  }
}

// ✅ 세부 이벤트 수정
async function modifySubEvent(data, sub_event_code) {
  try {
    const result = await eventMapper.updateSubEvent(data, sub_event_code);
    return result;
  } catch (err) {
    console.error("[eventService.js || 세부 이벤트 수정 실패]", err.message);
    throw err;
  }
}

// ✅ 세부 이벤트 삭제
async function removeSubEvent(sub_event_code) {
  try {
    const result = await eventMapper.deleteSubEvent(sub_event_code);
    return result;
  } catch (err) {
    console.error("[eventService.js || 세부 이벤트 삭제 실패]", err.message);
    throw err;
  }
}

module.exports = {
  getEventList,
  getEvent,
  createEvent,
  modifyEvent,
  removeEvent,
  getSubEventList,
  getSubEvent,
  createSubEvent,
  modifySubEvent,
  removeSubEvent,
};
