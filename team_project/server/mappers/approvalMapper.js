// team_project/server/Mappers/approvalMapper.js
const pool = require("../configs/db.js");
const approvalSQL = require("../sql/approvalSQL.js");

// 반환형 안전 분기:
// - mysql2/promise: [rows:Array, fields:Array] => rows = ret[0]
// - mariadb: rows:Array (행 배열 자체)         => rows = ret
function getRows(ret) {
  if (Array.isArray(ret)) {
    // mysql2/promise인 경우 rows가 ret[0]에 "배열"로 들어옴
    if (Array.isArray(ret[0])) return ret[0];
    // mariadb인 경우 ret 자체가 행 배열
    return ret;
  }
  throw new Error("Unexpected return format");
}

// 관리자 승인 요청 목록
async function managerApprovalList() {
  const conn = await pool.getConnection();
  try {
    const ret = await conn.query(approvalSQL.managerApprovalList);
    const rows = getRows(ret);
    return rows; // 반드시 배열
  } finally {
    conn.release();
  }
}
