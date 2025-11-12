const pool = require('../configs/db');
const authUserSQL = require('../sql/authUserSQL');

// 중복 확인
async function findUserId(id) {
  try {
    const rows = await pool.query(authUserSQL.FIND_ID, [id]);
    if (rows.length > 0) {
      return { ok: false, message: '이미 사용중인 아이디입니다.' };
    }
    return { ok: true, message: '사용 가능한 아이디입니다.' };
  } catch (err) {
    console.error('[ findUserId 실패 ] : ', err);
    throw err;
  }
}

module.exports = { findUserId };
