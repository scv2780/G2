const pool = require("../configs/db.js");
const sponsorSql = require("../sql/sponsorSql.js");

async function sponsorSQL() {
  let sponsorConn;
  try {
    sponsorConn = await pool.getConnection();
    const sponsorRows = await sponsorConn.query(sponsorSql.sponsor_all);
    console.log("[ sponsorConn.js || 성공 ]");
    return sponsorRows;
  } catch (err) {
    console.error("[ sponsorConn.js || 실패 ]", err.message);
    throw err;
  } finally {
    if (sponsorConn) sponsorConn.release();
  }
}
async function programAddSQL() {
  let sponsorConn;
  try {
    sponsorConn = await pool.getConnection();
    const sponsorRows = await sponsorConn.query(sponsorSql.sponsor_program);
    console.log("[ sponsorConn.js || 성공 ]");
    return sponsorRows;
  } catch (err) {
    console.error("[ sponsorConn.js || 실패 ]", err.message);
    throw err;
  } finally {
    if (sponsorConn) sponsorConn.release();
  }
}

module.exports = { sponsorSQL, programAddSQL };
