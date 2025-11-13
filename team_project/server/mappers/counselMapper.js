// server/mappers/counselMapper.js
const pool = require("../configs/db");
const sql = require("../sql/counselSql");

// BigInt → Number (JSON 직렬화 보호)
function safeJSON(v) {
  return JSON.parse(
    JSON.stringify(v, (_, x) => (typeof x === "bigint" ? Number(x) : x))
  );
}

/**
 * 역할별 상담 목록
 * - role = 2(담당자): assi_by = userId 인 것만
 * - role = 3,4(관리자/시스템): 전체
 */
async function listCounselByRole(role, userId) {
  const conn = await pool.getConnection();
  try {
    let rows;

    if (role === 2) {
      // 담당자용: 내가 담당자로 배정된 상담만
      rows = await conn.query(sql.listCounselByAssignee, [userId]);
    } else if (role === 3 || role === 4) {
      // 관리자/시스템: 전체 상담
      rows = await conn.query(sql.listCounselAll);
    } else {
      // 기타 역할이면 일단 전체로 (필요시 정책 변경)
      rows = await conn.query(sql.listCounselAll);
    }

    return safeJSON(rows);
  } finally {
    conn.release();
  }
}

// 상담 작성 / 수정 (공통)
async function saveCounsel(body) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { submitCode, priority, mainForm, records } = body;

    // 1) 기존 상담 존재 여부 확인
    const exist = await conn.query(sql.getCounselBySubmit, [submitCode]);

    let counsel_code;
    const now = new Date();

    if (exist.length === 0) {
      // 1-1) 신규 상담 생성
      const res = await conn.query(sql.insertCounselNote, [
        submitCode, // submit_code
        "REQ", // status
        now, // written_at
      ]);
      counsel_code = res.insertId;
    } else {
      // 1-2) 상담 업데이트
      counsel_code = exist[0].counsel_code;

      await conn.query(sql.updateCounselNote, [
        "REQ", // status
        now, // written_at
        counsel_code,
      ]);
    }

    // 2) 기존 상담 상세 삭제
    await conn.query(sql.deleteCounselDetails, [counsel_code]);

    // 3) 상담 상세 입력
    //    (추가 기록들)
    for (const rec of records || []) {
      await conn.query(sql.insertCounselDetail, [
        counsel_code,
        rec.counselDate,
        rec.title,
        rec.content,
        null, // attach_code
      ]);
    }

    //    (메인 상담도 기록으로 넣기)
    if (mainForm && (mainForm.title || mainForm.content)) {
      await conn.query(sql.insertCounselDetail, [
        counsel_code,
        mainForm.counselDate,
        mainForm.title,
        mainForm.content,
        null,
      ]);
    }

    // 4) 우선순위 초기화 + 저장
    await conn.query(sql.resetPriority, [submitCode]);
    await conn.query(sql.insertPriority, [submitCode, priority || "계획", "Y"]);

    // 5) 제출본 상태 변경 (요청 상태로)
    await conn.query(sql.updateSubmissionStatusToReq, ["REQ", submitCode]);

    // 6) 🔥 승인요청 request_approval 인서트
    //   - requester_code : 지금 상담 작성한 담당자 (임시로 2)
    //   - processor_code : 처리자(관리자) (임시로 1)
    //   - approval_type  : 'AE3'
    //   - state          : 'BA1'
    //   - linked_table_name : 'counsel_note'
    //   - linked_record_pk  : 방금 저장한 counsel_code
    await conn.query(sql.insertRequestApproval, [
      2, // requester_code (담당자 user_code)
      1, // processor_code (관리자 user_code)
      "AE3", // approval_type
      "BA1", // state
      "counsel_note", // linked_table_name
      counsel_code, // linked_record_pk
    ]);

    await conn.commit();
    return safeJSON({
      counsel_code,
      mode: exist.length ? "update" : "insert",
    });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// 상세보기 + 수정
async function getCounselDetail(submitCode) {
  const conn = await pool.getConnection();
  try {
    // 1) 헤더 + 기본 제출/작성자 정보
    const headerRows = await conn.query(sql.getCounselHeaderBySubmit, [
      submitCode,
    ]);

    if (!headerRows || headerRows.length === 0) {
      return null;
    }
    const h = headerRows[0];

    // 2) 상담 상세들
    const detailRows = await conn.query(sql.getCounselDetailsByCounsel, [
      h.counsel_code,
    ]);

    // 3) 우선순위
    const prRows = await conn.query(sql.getCurrentPriorityBySubmit, [
      submitCode,
    ]);
    const priority = prRows[0]?.level || "계획";

    // 메인 상담 하나 + 나머지 상세 배열로 분리 (첫 번째를 메인으로 사용)
    const mainDetail = detailRows[0] || null;
    const otherDetails = detailRows.slice(1);

    return safeJSON({
      submit_info: {
        name: h.writer_name,
        ssnFront: h.ssn_front,
        submitAt: h.submit_at,
      },
      main: mainDetail
        ? {
            counsel_date: mainDetail.counsel_date,
            title: mainDetail.title,
            content: mainDetail.content,
          }
        : {
            counsel_date: "",
            title: "",
            content: "",
          },
      details: otherDetails.map((d) => ({
        detail_code: d.detail_code,
        counsel_date: d.counsel_date,
        title: d.title,
        content: d.content,
      })),
      priority,
      status: h.status,
    });
  } finally {
    conn.release();
  }
}

// 상담 승인 (request_approval.state = BA2)
async function approveCounsel(submitCode) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) submitCode 로 counsel_code 찾기
    const exist = await conn.query(sql.getCounselBySubmit, [submitCode]);
    if (!exist.length) {
      throw new Error("해당 제출코드의 상담이 존재하지 않습니다.");
    }
    const counselCode = exist[0].counsel_code;

    // 2) request_approval 상태 BA2로 업데이트
    const result = await conn.query(sql.updateApprovalApprove, [counselCode]);

    await conn.commit();
    return safeJSON({ affectedRows: result.affectedRows });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// 상담 반려 (request_approval.state = BA3 + rejection_reason)
async function rejectCounsel(submitCode, reason) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) submitCode 로 counsel_code 찾기
    const exist = await conn.query(sql.getCounselBySubmit, [submitCode]);
    if (!exist.length) {
      throw new Error("해당 제출코드의 상담이 존재하지 않습니다.");
    }
    const counselCode = exist[0].counsel_code;

    // 2) request_approval 상태 BA3로 + 반려사유
    const result = await conn.query(sql.updateApprovalReject, [
      reason || "",
      counselCode,
    ]);

    await conn.commit();
    return safeJSON({ affectedRows: result.affectedRows });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = {
  listCounselByRole,
  saveCounsel,
  getCounselDetail,
  approveCounsel,
  rejectCounsel,
};
