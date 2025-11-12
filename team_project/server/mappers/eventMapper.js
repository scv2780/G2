const pool = require("../configs/db.js");
const eventSQL = require("../sql/eventSQL");

async function eventListSQL() {
  let eventConn;
  try {
    eventConn = await pool.getConnection();
    const eventRows = await eventConn.query(eventSQL.SELECT_ALL);
    console.log("[ testMapper.js || 성공 ]");
    return eventRows;
  } catch (err) {
    console.error("[ testMapper.js || 실패 ]", err.message);
    throw err;
  } finally {
    if (eventConn) eventConn.release();
  }
}

module.exports = { eventListSQL };
