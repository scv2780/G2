const pool = require("../configs/db.js");
const approvalSQL = require("../sql/approvalSQL");

function rowsFrom(ret) {
  if (Array.isArray(ret) && Array.isArray(ret[0])) return ret[0];
  return ret;
}

async function managerApprovalList({ state, keyword, page, size }) {
  const conn = await pool.getConnection();
  try {
    const st = state || "";
    const kw = keyword || "";
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const sizeNum = Number(size) > 0 ? Number(size) : 20;
    const offset = (pageNum - 1) * sizeNum;

    const params = [
      st,
      st, // 상태 필터
      kw,
      kw,
      kw,
      kw,
      kw,
      kw, // (검색까지 이미 구현해뒀다면 이 부분 유지)
      offset,
      sizeNum,
    ];

    const ret = await conn.query(approvalSQL.managerApprovalList, params);
    const rows = rowsFrom(ret);
    console.log(
      "[approvalMapper] managerApprovalList rows:",
      rows.length,
      "| state:",
      st,
      "| keyword:",
      kw,
      "| page:",
      pageNum
    );
    return rows;
  } finally {
    conn.release();
  }
}

/** ✅ 승인/반려 공통 업데이트 + 승인 시 사용자 활성화(is_active=1) */
async function updateApprovalState({ approvalCode, nextState }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const params = [nextState, approvalCode];

    console.log(
      "[approvalMapper] updateApprovalState SQL:",
      approvalSQL.updateApprovalState,
      "params:",
      params
    );

    const ret = await conn.query(approvalSQL.updateApprovalState, params);
    const result = ret[0] || ret;

    console.log(
      "[approvalMapper] updateApprovalState result:",
      result.affectedRows
    );

    // ✅ 승인(BA2)일 때만 사용자 계정 활성화
    if (nextState === "BA2" && result.affectedRows > 0) {
      console.log(
        "[approvalMapper] activateUserByApproval SQL:",
        approvalSQL.activateUserByApproval,
        "params:",
        [approvalCode]
      );
      await conn.query(approvalSQL.activateUserByApproval, [approvalCode]);
    }

    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** ✅ approvalCode로 요청자 정보 조회 (이메일, 이름 등) */
async function findApprovalWithUser({ approvalCode }) {
  const conn = await pool.getConnection();
  try {
    const ret = await conn.query(approvalSQL.findApprovalWithUser, [
      approvalCode,
    ]);
    const rows = rowsFrom(ret);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

// 기관 담당자 승인 요청 목록 조회
async function staffApprovalList({ state, keyword, page, size }) {
  const conn = await pool.getConnection();
  try {
    const st = state || "";
    const kw = keyword || "";
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const sizeNum = Number(size) > 0 ? Number(size) : 20;
    const offset = (pageNum - 1) * sizeNum;

    const params = [
      st,
      st, // 상태 필터
      kw,
      kw,
      kw,
      kw,
      kw,
      kw,
      offset,
      sizeNum,
    ];

    const ret = await conn.query(approvalSQL.staffApprovalList, params);
    const rows = rowsFrom(ret);

    console.log(
      "[approvalMapper] staffApprovalList rows:",
      rows.length,
      "| state:",
      st,
      "| keyword:",
      kw,
      "| page:",
      pageNum
    );
    return rows;
  } finally {
    conn.release();
  }
}

/** ✅ 기관 담당자 승인/반려 공통 업데이트 (BA2 / BA3) + 승인 시 사용자 활성화 */
async function updateApprovalStateForStaff({ approvalCode, nextState }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const params = [nextState, approvalCode];

    console.log(
      "[approvalMapper] updateApprovalStateForStaff SQL:",
      approvalSQL.updateApprovalState,
      "params:",
      params
    );

    const ret = await conn.query(approvalSQL.updateApprovalState, params);
    const result = ret[0] || ret;

    console.log(
      "[approvalMapper] updateApprovalStateForStaff result:",
      result.affectedRows
    );

    // ✅ 승인(BA2)일 때만 사용자 계정 활성화
    if (nextState === "BA2" && result.affectedRows > 0) {
      console.log(
        "[approvalMapper] activateUserByApproval SQL:",
        approvalSQL.activateUserByApproval,
        "params:",
        [approvalCode]
      );
      await conn.query(approvalSQL.activateUserByApproval, [approvalCode]);
    }

    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  managerApprovalList,
  updateApprovalState,
  findApprovalWithUser,
  staffApprovalList,
  updateApprovalStateForStaff,
};
