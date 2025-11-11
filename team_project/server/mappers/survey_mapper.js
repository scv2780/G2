const pool = require("../configs/db");
const sqlList = require("../sql/surveySql");

// 공용 쿼리 함수
async function query(sqlKey, params = []) {
  const sql = sqlList[sqlKey];
  if (!sql) {
    throw new Error(`Unknown SQL key: ${sqlKey}`);
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    // mariadb 드라이버는 rows에 메타 컬럼이 붙을 수 있음
    return rows;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { query };
