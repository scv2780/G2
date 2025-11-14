// server/mappers/counselMapper.js
const pool = require("../configs/db");
const sql = require("../sql/counselSql");

// BigInt → Number (JSON 직렬화 보호)
function safeJSON(v) {
  return JSON.parse(
    JSON.stringify(v, (_, x) => (typeof x === "bigint" ? Number(x) : x))
  );
}

// 🔹 파일명 DB 저장용 인코더
function encodeFilenameForDb(name) {
  return name || "";
}

// 🔹 DB에서 읽어온 파일명 복원용 디코더
function decodeFilenameFromDb(name) {
  if (!name) return name;
  try {
    return decodeURIComponent(name); // "%ED%85%8C..." → "테스트파일.docx"
  } catch (e) {
    // 예전에 깨진 값이나, 인코딩 안 된 값은 그대로 돌려보냄
    return name;
  }
}

//빈 문자열('')을 NULL 로 바꿔서 DATE 컬럼에 넣을 수 있게 해주는 헬퍼
function normalizeDateForDb(val) {
  if (val == null) return null; // null, undefined
  if (typeof val === "string" && val.trim() === "") return null;
  return val; // '2025-11-14' 같은 정상 값은 그대로
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

// 저장 / 수정 / 재수정
async function saveCounsel(body, files = []) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      submitCode,
      priority,
      mainForm,
      records,
      removeAttachmentCodes = [], // 🔹 프론트에서 넘어오는 삭제 대상 첨부코드 배열
    } = body;

    // 1) 기존 상담 존재 여부 확인
    const exist = await conn.query(sql.getCounselBySubmit, [submitCode]);

    let counsel_code;
    const now = new Date();
    let needApprovalRequest = false; // 🔹 이번 저장에서 승인요청을 새로 넣어야 하는지 여부

    if (exist.length === 0) {
      // 🔹 첫 작성: status = CB3(검토전)으로 신규 생성 + 승인요청 필요
      const res = await conn.query(sql.insertCounselNote, [
        submitCode, // submit_code
        "CB3", // status
        now, // written_at
      ]);
      counsel_code = res.insertId;
      needApprovalRequest = true; // 👉 처음 작성이므로 승인요청 생성
    } else {
      // 🔹 기존 상담 있음
      counsel_code = exist[0].counsel_code;
      const currentStatus = (exist[0].status || "").trim().toUpperCase();

      if (currentStatus === "CB4") {
        // ✅ 반려 상태에서 재작성하는 경우:
        //    - updateCounselNoteKeepStatus: status를 CB6 등으로 변경
        //    - 승인요청 다시 넣어야 함
        await conn.query(sql.updateCounselNoteKeepStatus, [
          now, // written_at
          counsel_code, // WHERE counsel_code = ?
        ]);
        needApprovalRequest = true; // 👉 재작성이므로 승인요청 다시 생성
      } else {
        // ✅ 일반 수정:
        //    - 기존 status 그대로 유지 (CB3면 CB3, CB5면 CB5 유지)
        //    - 승인요청은 새로 만들지 않음
        await conn.query(sql.updateCounselNote, [
          currentStatus, // 기존 상태 그대로
          now, // written_at
          counsel_code,
        ]);
        // needApprovalRequest = false 그대로 유지
      }
    }

    // 2) 기존 상담 상세 삭제
    await conn.query(sql.deleteCounselDetails, [counsel_code]);

    // 3) 상담 상세 입력들
    for (const rec of records || []) {
      await conn.query(sql.insertCounselDetail, [
        counsel_code,
        rec.counselDate,
        rec.title,
        rec.content,
        null, // attach_code (지금은 상담 상세별 첨부는 사용 안 함)
      ]);
    }

    if (mainForm && (mainForm.title || mainForm.content)) {
      await conn.query(sql.insertCounselDetail, [
        counsel_code,
        mainForm.counselDate,
        mainForm.title,
        mainForm.content,
        null,
      ]);
    }

    // 4) 우선순위 처리
    await conn.query(sql.resetPriority, [submitCode]);
    await conn.query(sql.insertPriority, [submitCode, priority || "계획", "Y"]);

    // 5) 🔥 첨부파일 처리
    // 5-1) 기존 첨부 중 "삭제 예정"으로 체크된 것만 삭제
    if (Array.isArray(removeAttachmentCodes) && removeAttachmentCodes.length) {
      for (const attachCode of removeAttachmentCodes) {
        if (attachCode == null) continue;
        await conn.query(sql.deleteAttachmentOne, [
          counsel_code, // linked_record_pk
          attachCode, // attach_code
        ]);
      }
    }

    // 5-2) 새로 업로드된 파일들 INSERT
    if (Array.isArray(files) && files.length > 0) {
      const basePath = "/uploads/counsel"; // app.js에서 app.use("/uploads", ...) 주었던 경로 기준

      for (const f of files) {
        await conn.query(sql.insertAttachment, [
          f.originalname, // 🔹 한글 그대로 저장
          f.filename, // 서버 저장 파일명
          basePath,
          "counsel_note",
          counsel_code,
        ]);
      }
    }

    // 6) 🔥 승인요청은 "처음 작성" 또는 "반려 후 재작성"일 때만 생성
    if (needApprovalRequest) {
      await conn.query(sql.insertRequestApproval, [
        2, // requester_code (담당자, 임시)
        1, // processor_code (관리자, 임시)
        "AE3", // approval_type
        "BA1", // state (요청)
        "counsel_note",
        counsel_code,
      ]);
    }

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

    // 4) 🔹 첨부파일 목록
    const attachRows = await conn.query(sql.getAttachmentsByCounsel, [
      h.counsel_code,
    ]);

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

      // 🔹 프론트에서 바로 쓰기 좋게 가공
      attachments: (attachRows || []).map((a) => ({
        attachCode: a.attach_code,
        originalFilename: decodeFilenameFromDb(a.original_filename),
        serverFilename: a.server_filename,
        filePath: a.file_path, // 예: '/uploads/counsel'
        url: `${a.file_path}/${a.server_filename}`, // 예: '/uploads/counsel/파일명_20251114.hwp'
      })),
    });
  } finally {
    conn.release();
  }
}

// 상담 승인 (request_approval.state = BA2 + counsel_note.status = CB5 + support_plan 생성)
async function approveCounsel(submitCode) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) submitCode 로 counsel_note 찾기
    const exist = await conn.query(sql.getCounselBySubmit, [submitCode]);
    if (!exist.length) {
      throw new Error("해당 제출코드의 상담이 존재하지 않습니다.");
    }
    const counselCode = exist[0].counsel_code;

    // 2) support_plan 생성 (이미 있으면 안 만들기)
    const spExist = await conn.query(sql.getSupportPlanBySubmit, [submitCode]);

    if (!spExist.length) {
      // survey_submission 에서 assi_by 조회
      const assiRows = await conn.query(sql.getAssigneeBySubmit, [submitCode]);
      const assiBy = assiRows[0]?.assi_by || null;

      // support_plan INSERT
      await conn.query(sql.insertSupportPlan, [
        submitCode, // submit_code
        "CC2", // status
        assiBy, // assi_by (담당자 코드)
      ]);
    }

    // 3) request_approval 상태 BA2로 업데이트
    const result = await conn.query(sql.updateApprovalApprove, [counselCode]);

    // 4) counsel_note.status = 'CB5' (검토완료) 로 변경
    await conn.query(sql.updateCounselNoteApprove, [counselCode]);

    await conn.commit();
    return safeJSON({ affectedRows: result.affectedRows });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// 상담 반려 (request_approval.state = BA3 + rejection_reason + counsel_note.status = CB4)
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

    // 3) ✅ counsel_note.status = 'CB4' (반려) 로 변경
    await conn.query(sql.updateCounselNoteReject, [counselCode]);

    await conn.commit();
    return safeJSON({ affectedRows: result.affectedRows });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

//  반려 사유 조회
async function getRejectionReason(submitCode) {
  const conn = await pool.getConnection();
  try {
    // 1) submitCode 로 counsel_note 찾기
    const exist = await conn.query(sql.getCounselBySubmit, [submitCode]);
    if (!exist || exist.length === 0) {
      // 해당 제출코드에 상담 자체가 없으면 null
      return null;
    }

    const counselCode = exist[0].counsel_code;

    // 2) request_approval 에서 반려 사유 조회
    const rows = await conn.query(sql.getRejectReasonByCounsel, [counselCode]);

    if (!rows || rows.length === 0) {
      // 반려 이력이 없으면 null
      return null;
    }

    // { rejection_reason: '...' } 형태로 리턴
    return safeJSON(rows[0]);
  } finally {
    conn.release();
  }
}

// 🔹 상담 임시저장
async function saveCounselTemp(body) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { submitCode, priority, mainForm, records } = body;
    const now = new Date();

    // 1) 기존 상담 존재 여부 확인
    const exist = await conn.query(sql.getCounselBySubmit, [submitCode]);

    let counsel_code;

    if (exist.length === 0) {
      // 처음 임시저장: status = CB1 (임시저장)
      const res = await conn.query(sql.insertCounselNote, [
        submitCode,
        "CB1", // 임시저장
        now,
      ]);
      counsel_code = res.insertId;
    } else {
      // 이미 있는 상담 → status 만 CB1 로 세팅 + written_at 갱신
      counsel_code = exist[0].counsel_code;
      await conn.query(sql.updateCounselNote, [
        "CB1", // status = 임시저장
        now,
        counsel_code,
      ]);
    }

    // 2) 기존 상담 상세 싹 지우고
    await conn.query(sql.deleteCounselDetails, [counsel_code]);

    // 3) 메인 상담 내용 (완전 빈 값이면 INSERT 안 함)
    if (mainForm) {
      const mainDate = normalizeDateForDb(mainForm.counselDate);
      const mainTitle = (mainForm.title || "").trim();
      const mainContent = (mainForm.content || "").trim();

      // 🔸 날짜/제목/내용이 전부 빈 경우는 굳이 row 안 만든다
      if (mainDate || mainTitle || mainContent) {
        await conn.query(sql.insertCounselDetail, [
          counsel_code,
          mainDate, // '' → null 처리됨
          mainTitle,
          mainContent,
          null,
        ]);
      }
    }

    // 4) 추가 상담 기록들
    for (const rec of records || []) {
      const recDate = normalizeDateForDb(rec.counselDate);
      const recTitle = (rec.title || "").trim();
      const recContent = (rec.content || "").trim();

      // 🔸 완전히 빈 줄은 스킵
      if (!recDate && !recTitle && !recContent) continue;

      await conn.query(sql.insertCounselDetail, [
        counsel_code,
        recDate, // '' → null
        recTitle,
        recContent,
        null,
      ]);
    }

    // 5) 우선순위도 임시저장에 반영하고 싶으면 그대로 유지
    await conn.query(sql.resetPriority, [submitCode]);
    await conn.query(sql.insertPriority, [submitCode, priority || "계획", "Y"]);

    await conn.commit();
    return safeJSON({
      counsel_code,
      mode: exist.length ? "update-temp" : "insert-temp",
    });
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
  getRejectionReason,
  saveCounselTemp,
};
