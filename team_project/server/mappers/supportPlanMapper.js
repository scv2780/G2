// server/mappers/supportPlanMapper.js
const pool = require("../configs/db");
const sql = require("../sql/supportPlanSql");

function safeJSON(v) {
  return JSON.parse(
    JSON.stringify(v, (_, x) => (typeof x === "bigint" ? Number(x) : x))
  );
}

// server/mappers/supportPlanMapper.js
async function listSupportPlansByRole(role, userId) {
  const conn = await pool.getConnection();
  try {
    // 🔥 역할/유저 상관 없이 전체 조회
    const rows = await conn.query(sql.listSupportPlanAll);

    const mapped = rows.map((r) => ({
      planCode: r.plan_code,
      submitCode: r.submit_code,
      status: r.status,
      writtenAt: r.written_at,
      submitAt: r.submit_at,
      writerName: r.writer_name,
      assiName: r.assi_name,
    }));

    return safeJSON(mapped);
  } finally {
    conn.release();
  }
}

module.exports = {
  listSupportPlansByRole,
};
