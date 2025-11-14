// Table : event, sub_event, event_apply, event_result

// 이벤트 메인페이지
const selectEventMainpage = `
  SELECT 
    e.event_code,
    e.event_name,
    e.event_start_date,
    e.event_end_date,
    e.recruit_start_date,
    e.recruit_end_date,
    e.max_participants,
    COALESCE(SUM(se.sub_recruit_count), 0) AS total_sub_recruit_count,
    a.server_filename,
    a.file_path
  FROM event e
  LEFT JOIN sub_event se ON e.event_code = se.event_code
  LEFT JOIN (
    SELECT linked_record_pk, MIN(server_filename) AS server_filename, MIN(file_path) AS file_path
    FROM attachment
    WHERE linked_table_name = 'event'
      AND LOWER(SUBSTRING_INDEX(original_filename, '.', -1)) IN ('jpg', 'jpeg', 'png', 'gif')
    GROUP BY linked_record_pk
  ) a ON e.event_code = a.linked_record_pk
  GROUP BY e.event_code
  ORDER BY e.event_code DESC
`;

// 이벤트 목록(검색조건)
const selectEventList = `
  SELECT 
    e.event_code,
    e.event_name,
    e.event_start_date,
    e.event_end_date,
    e.recruit_start_date,
    e.recruit_end_date,
    e.max_participants,
    COALESCE(SUM(se.sub_recruit_count), 0) AS total_sub_recruit_count,
    a.server_filename,
    a.file_path
  FROM event e
  LEFT JOIN sub_event se ON e.event_code = se.event_code
  LEFT JOIN (
    SELECT linked_record_pk, MIN(server_filename) AS server_filename, MIN(file_path) AS file_path
    FROM attachment
    WHERE linked_table_name = 'event'
      AND LOWER(SUBSTRING_INDEX(original_filename, '.', -1)) IN ('jpg', 'jpeg', 'png', 'gif')
    GROUP BY linked_record_pk
  ) a ON e.event_code = a.linked_record_pk
  WHERE 1=1
    -- 모집상태
    AND (? IS NULL OR e.recruit_status = ?)
    -- 모집기간
    AND (? IS NULL OR e.recruit_start_date >= ?)
    AND (? IS NULL OR e.recruit_end_date <= ?)
    -- 시행기간
    AND (? IS NULL OR e.event_start_date >= ?)
    AND (? IS NULL OR e.event_end_date <= ?)
    -- 이벤트명
    AND (? IS NULL OR e.event_name LIKE CONCAT('%', ?, '%'))
  GROUP BY e.event_code
  ORDER BY e.event_code DESC
`;

// // 첨부파일 등록
// const insertAttachment = `
// INSERT INTO attachment (
//   original_filename,
//   server_filename,
//   file_path,
//   linked_table_name,
//   linked_record_pk
// ) VALUES (?, ?, ?, ?, ?)
// `;

// // 첨부파일 조회
// const selectAttachList = `
// SELECT
//     attach_code,
//     original_filename,
//     server_filename,
//     file_path
// FROM attachment
// WHERE linked_table_name = 'event'
//   AND linked_record_pk = ?

// `;

// 매니저 등록
const insertManager = `
INSERT INTO manager (
  manager_category,
  manager_category_code,
  manager_type,
  user_code
) VALUES (?, ?, ?, ?)
`;

// 매니저 조회
const selectManager = `
SELECT 
    m.manager_num,
    u.name AS manager_name,
    m.manager_type,
    m.manager_category
FROM manager m
LEFT JOIN users u ON m.user_code = u.user_code
WHERE m.manager_category_code IS NOT NULL
  AND m.manager_type IN ('DA1','DA2')
  AND m.manager_category = 'DB2'
  AND m.manager_category_code = ?
`;

// 이벤트 단건조회
const selectEventOne = `
-- selectEventOne
SELECT 
    e.event_code,
    e.event_name,
    e.event_content,
    e.event_location,
    e.target_audience,
    e.max_participants,
    e.recruit_start_date,
    e.recruit_end_date,
    e.event_start_date,
    e.event_end_date,
    e.recruit_status, -- 코드값만
    e.event_type,     -- 코드값만
    org.org_name AS org_name,
    u.name AS main_manager_name
FROM event e
LEFT JOIN organization org ON e.org_code = org.org_code
LEFT JOIN users u ON e.user_code = u.user_code
WHERE e.event_code = ?
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
  SELECT 
    sub_event_code,
    sub_event_name,
    sub_event_start_date,
    sub_event_end_date,
    sub_recruit_count
FROM sub_event
WHERE event_code = ?
ORDER BY sub_event_code ASC
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
  selectEventMainpage,
  selectEventList,
  selectEventOne,
  insertEvent,
  updateEvent,
  deleteEvent,
  selectSubEventList,
  insertSubEvent,
  updateSubEvent,
  deleteSubEvent,
  insertAttachment,
  insertManager,
  selectAttachList,
  selectManager,
};
