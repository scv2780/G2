// Table : event, sub_event, event_apply, event_result

// 이벤트 전체조회
const selectEventList = `
  SELECT event_code
        ,org_code
        ,event_type
        ,user_code
        ,event_name
        ,event_content
        ,event_location
        ,target_audience
        ,max_participants
        ,recruit_start_date
        ,recruit_end_date
        ,event_start_date
        ,event_end_date
        ,recruit_status
        ,event_register_date
        ,register_status
  FROM event
  ORDER BY event_code ASC
`;

// 이벤트 단건조회
const selectEventOne = `
SELECT event_code
        ,org_code
        ,user_code
        ,event_name
        ,event_content
        ,event_location
        ,target_audience
        ,max_participants
        ,recruit_start_date
        ,recruit_end_date
        ,event_start_date
        ,event_end_date
        ,recruit_status
        ,event_register_date
        ,register_status
  FROM event
  WHERE event_code = ?
`;

// 이벤트 등록
const insertEvent = `
INSERT INTO event (
  org_code
 ,user_code
 ,event_name
 ,event_type
 ,event_content
 ,event_location
 ,target_audience
 ,max_participants
 ,recruit_start_date
 ,recruit_end_date
 ,event_start_date
 ,event_end_date
 ,recruit_status
 ,event_register_date
 ,register_status)
VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
`;

// 이벤트 수정
const updateEvent = `
UPDATE event
SET ?
WHERE event_code = ?
`;

// 이벤트 삭제
const deleteEvent = `
DELETE FROM event
WHERE event_code = ?`;

// 세부 이벤트 조회
const selectSubEventList = `
  SELECT sub_event_code
        ,sub_event_name
        ,sub_event_start_date
        ,sub_event_end_date
        ,sub_recruit_status
        ,event_code
  FROM sub_event
  ORDER BY sub_event_code ASC
`;

// 세부 이벤트 단건조회
const selectSubEventOne = `
  SELECT sub_event_code
        ,sub_event_name
        ,sub_event_start_date
        ,sub_event_end_date
        ,sub_recruit_status
        ,event_code
  FROM sub_event
  WHERE sub_event_code = ?
`;

// 세부 이벤트 등록
const insertSubEvent = `
INSERT INTO sub_event (
   sub_event_name
  ,sub_event_start_date
  ,sub_event_end_date
  ,sub_recruit_count
  ,event_code)
VALUES ( ?, ?, ?, ?, ? )
`;

// 세부 이벤트 수정
const updateSubEvent = `
UPDATE sub_event
SET ?
WHERE sub_event_code = ?
`;

// 세부 이벤트 삭제
const deleteSubEvent = `
DELETE FROM sub_event
WHERE sub_event_code = ?`;

module.exports = {
  selectEventList,
  selectEventOne,
  insertEvent,
  updateEvent,
  deleteEvent,
  selectSubEventList,
  selectSubEventOne,
  insertSubEvent,
  updateSubEvent,
  deleteSubEvent,
};
