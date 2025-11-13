// eventMapper.js
const pool = require("../configs/db.js");
const eventSQL = require("../sql/eventSQL");
const moment = require("moment");

// ==========================
// 이벤트
// ==========================

// ✅ 이벤트 메인페이지
async function selectEventMainpage() {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(eventSQL.selectEventMainpage);
    console.log("[eventMapper.js || 이벤트 메인페이지 목록 조회 성공]", rows);
    return rows;
  } catch (err) {
    console.error(
      "[eventMapper.js || 이벤트 메인페이지 목록 조회 실패]",
      err.message
    );
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 이벤트 목록
async function selectEventList(filters) {
  let conn;
  try {
    conn = await pool.getConnection();

    const params = [
      filters.recruit_status,
      filters.recruit_status,
      filters.recruit_start_date,
      filters.recruit_start_date,
      filters.recruit_end_date,
      filters.recruit_end_date,
      filters.event_start_date,
      filters.event_start_date,
      filters.event_end_date,
      filters.event_end_date,
      filters.event_name,
      filters.event_name,
    ];

    const rows = await conn.query(eventSQL.selectEventList, params);
    console.log("[eventMapper.js || 이벤트 목록 조회 성공]", rows);
    return rows;
  } catch (err) {
    console.error("[eventMapper.js || 이벤트 목록 조회 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 이벤트 단건 조회
async function selectEventOne(event_code) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(eventSQL.selectEventOne, [event_code]);
    console.log("[eventMapper.js || 이벤트 단건조회 성공]");
    return rows[0]; // 단건 조회이므로 첫번째 객체 반환
  } catch (err) {
    console.error("[eventMapper.js || 이벤트 단건조회 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// 이벤트 + 세부 이벤트 + 첨부파일 + 서브매니저 등록
async function addEventFull(data) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1️⃣ 이벤트 등록
    const eventParams = [
      data.org_code,
      data.user_code,
      data.event_name,
      data.event_type,
      data.event_content,
      data.event_location,
      data.target_audience,
      data.max_participants,
      moment(data.recruit_start_date).format("YYYY-MM-DD"),
      moment(data.recruit_end_date).format("YYYY-MM-DD"),
      moment(data.event_start_date).format("YYYY-MM-DD"),
      moment(data.event_end_date).format("YYYY-MM-DD"),
      data.recruit_status,
      moment(data.event_register_date).format("YYYY-MM-DD HH:mm:ss"),
      data.register_status,
    ];
    const eventResult = await conn.query(eventSQL.insertEvent, eventParams);
    const event_code = eventResult.insertId;

    // 2️⃣ 세부 이벤트 등록
    if (data.sub_events && data.sub_events.length > 0) {
      for (const sub of data.sub_events) {
        const subParams = [
          sub.sub_event_name,
          sub.sub_event_start_date,
          sub.sub_event_end_date,
          sub.sub_recruit_count,
          event_code,
        ];
        await conn.query(eventSQL.insertSubEvent, subParams);
      }
    }

    // 3️⃣ 첨부파일 등록
    if (data.attachments && data.attachments.length > 0) {
      for (const file of data.attachments) {
        const attachParams = [
          file.original_filename,
          file.server_filename,
          file.file_path,
          "event", // linked_table_name
          event_code, // linked_record_pk
        ];
        await conn.query(eventSQL.insertAttachment, attachParams);
      }
    }

    // 4️⃣ 메인 매니저 등록 (이벤트 등록한 회원)
    await conn.query(eventSQL.insertManager, [
      "DB2", // DB2 이벤트
      event_code,
      "DA1", // 메인 매니저
      data.user_code,
    ]);

    // 5️⃣ 서브 매니저 등록
    if (data.sub_managers && data.sub_managers.length > 0) {
      for (const subMgr of data.sub_managers) {
        await conn.query(eventSQL.insertManager, [
          "DB2", // DB2 이벤트
          event_code,
          "DA2", // 서브 매니저
          subMgr.user_code,
        ]);
      }
    }

    await conn.commit();
    return { event_code, ...data };
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("[eventMapper.js || 이벤트 전체 등록 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// 이벤트 + 세부 이벤트 등록
async function addEventWithSub(data) {
  let conn;
  try {
    conn = await pool.getConnection();
    // 1️⃣ 이벤트 등록
    const params = [
      data.org_code,
      data.user_code,
      data.event_name,
      data.event_type,
      data.event_content,
      data.event_location,
      data.target_audience,
      data.max_participants,
      moment(data.recruit_start_date).format("YYYY-MM-DD"),
      moment(data.recruit_end_date).format("YYYY-MM-DD"),
      moment(data.event_start_date).format("YYYY-MM-DD"),
      moment(data.event_end_date).format("YYYY-MM-DD"),
      data.recruit_status,
      moment(data.event_register_date).format("YYYY-MM-DD HH:mm:ss"),
      data.register_status,
    ];

    const result = await conn.query(eventSQL.insertEvent, params);
    const event_code = result.insertId; // 새로 생성된 이벤트 코드

    // 2️⃣ sub_events 등록 (예약제)
    if (data.sub_events && data.sub_events.length > 0) {
      for (const sub of data.sub_events) {
        const subParams = [
          sub.sub_event_name,
          sub.sub_event_start_date,
          sub.sub_event_end_date,
          sub.sub_recruit_count,
          event_code,
        ];
        await conn.query(eventSQL.insertSubEvent, subParams);
      }
    }

    return { event_code, ...data };
  } catch (err) {
    console.error(
      "[eventMapper.js || 이벤트+세부 이벤트 등록 실패]",
      err.message
    );
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 이벤트 등록
async function addEvent(data) {
  let conn;
  try {
    conn = await pool.getConnection();
    const params = [
      data.org_code,
      data.user_code,
      data.event_name,
      data.event_type,
      data.event_content,
      data.event_location,
      data.target_audience,
      data.max_participants,
      moment(data.recruit_start_date).format("YYYY-MM-DD"),
      moment(data.recruit_end_date).format("YYYY-MM-DD"),
      moment(data.event_start_date).format("YYYY-MM-DD"),
      moment(data.event_end_date).format("YYYY-MM-DD"),
      data.recruit_status,
      moment(data.event_register_date).format("YYYY-MM-DD HH:mm:ss"),
      data.register_status,
    ];
    const rows = await conn.query(eventSQL.insertEvent, params);
    console.log("[eventMapper.js || 이벤트 등록 성공]");
    return rows;
  } catch (err) {
    console.error("[eventMapper.js || 이벤트 등록 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// 이벤트 + 세부 이벤트 수정
async function updateEventWithSub(data, event_code) {
  let conn;
  try {
    conn = await pool.getConnection();

    // 1️⃣ 이벤트 테이블 업데이트
    await conn.query(eventSQL.updateEvent, [data, event_code]);

    // 2️⃣ 기존 세부 이벤트 삭제
    await conn.query(`DELETE FROM sub_event WHERE event_code = ?`, [
      event_code,
    ]);

    // 3️⃣ 새로운 sub_events 등록
    if (data.sub_events && data.sub_events.length > 0) {
      for (const sub of data.sub_events) {
        const subParams = [
          sub.sub_event_name,
          sub.sub_event_start_date,
          sub.sub_event_end_date,
          sub.sub_recruit_count,
          event_code,
        ];
        await conn.query(eventSQL.insertSubEvent, subParams);
      }
    }

    return { event_code, ...data };
  } catch (err) {
    console.error(
      "[eventMapper.js || 이벤트+세부 이벤트 수정 실패]",
      err.message
    );
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 이벤트 수정
async function updateEvent(data, event_code) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(eventSQL.updateEvent, [data, event_code]);
    console.log("[eventMapper.js || 이벤트 수정 성공]");
    return rows;
  } catch (err) {
    console.error("[eventMapper.js || 이벤트 수정 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 이벤트 삭제
async function deleteEvent(event_code) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(eventSQL.deleteEvent, [event_code]);
    console.log("[eventMapper.js || 이벤트 삭제 성공]");
    return rows;
  } catch (err) {
    console.error("[eventMapper.js || 이벤트 삭제 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ==========================
// 세부 이벤트
// ==========================

// ✅ 세부 이벤트 전체 조회
async function selectSubEventList() {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(eventSQL.selectSubEventList);
    console.log("[eventMapper.js || 세부 이벤트 전체조회 성공]");
    return rows;
  } catch (err) {
    console.error("[eventMapper.js || 세부 이벤트 전체조회 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 세부 이벤트 단건 조회
async function selectSubEventOne(sub_event_code) {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(eventSQL.selectSubEventOne, [
      sub_event_code,
    ]);
    console.log("[eventMapper.js || 세부 이벤트 단건조회 성공]");
    return rows[0];
  } catch (err) {
    console.error("[eventMapper.js || 세부 이벤트 단건조회 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 세부 이벤트 등록
async function addSubEvent(data) {
  let conn;
  try {
    conn = await pool.getConnection();
    const params = [
      data.sub_event_name,
      data.sub_event_start_date,
      data.sub_event_end_date,
      data.sub_recruit_count,
      data.event_code,
    ];
    const rows = await conn.query(eventSQL.insertSubEvent, params);
    console.log("[eventMapper.js || 세부 이벤트 등록 성공]");
    return rows;
  } catch (err) {
    console.error("[eventMapper.js || 세부 이벤트 등록 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 세부 이벤트 수정
async function updateSubEvent(data, sub_event_code) {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(eventSQL.updateSubEvent, [
      data,
      sub_event_code,
    ]);
    console.log("[eventMapper.js || 세부 이벤트 수정 성공]");
    return rows;
  } catch (err) {
    console.error("[eventMapper.js || 세부 이벤트 수정 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// ✅ 세부 이벤트 삭제
async function deleteSubEvent(sub_event_code) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(eventSQL.deleteSubEvent, [sub_event_code]);
    console.log("[eventMapper.js || 세부 이벤트 삭제 성공]");
    return rows;
  } catch (err) {
    console.error("[eventMapper.js || 세부 이벤트 삭제 실패]", err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  selectEventMainpage,
  selectEventList,
  selectEventOne,
  addEventWithSub,
  addEvent,
  updateEventWithSub,
  updateEvent,
  deleteEvent,
  selectSubEventList,
  selectSubEventOne,
  addSubEvent,
  updateSubEvent,
  deleteSubEvent,
  addEventFull,
};
