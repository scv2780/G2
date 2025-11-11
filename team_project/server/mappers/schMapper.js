const pool = require("../configs/db.js");
const schSQL = require("../sql/schSQL");

async function organizationList() {
  let testConn;
  try {
    testConn = await pool.getConnection();
    const testRows = await testConn.query(schSQL.organizationList);
    console.log("[ testMapper.js || 성공 ]");
    return testRows;
  } catch (err) {
    console.error("[ testMapper.js || 실패 ]", err.message);
    throw err;
  } finally {
    if (testConn) testConn.release();
  }
}

module.exports = { organizationList };
