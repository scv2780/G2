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

async function programAddSQL(programDataArray) {
  let sponsorConn;
  console.log(programDataArray);
  try {
    sponsorConn = await pool.getConnection();
    // ✨ 쿼리와 함께 데이터 배열을 두 번째 인수로 전달
    const sponsorRows = await sponsorConn.query(
      sponsorSql.sponsor_program,
      programDataArray // <--- 이 배열이 쿼리의 Placeholder(?)에 순서대로 바인딩됨
    );
    console.log("[ sponsorConn.js || 프로그램 등록 쿼리 성공 ]");
    return sponsorRows;
  } catch (err) {
    console.error("[ sponsorConn.js || 프로그램 등록 쿼리 실패 ]", err.message);
    throw err;
  } finally {
    if (sponsorConn) sponsorConn.release();
  }
}

async function programUpdateSQL(programDataArray) {
  let sponsorConn;
  console.log(programDataArray);
  try {
    sponsorConn = await pool.getConnection();
    // ✨ 쿼리와 함께 데이터 배열을 두 번째 인수로 전달
    const sponsorRows = await sponsorConn.query(
      sponsorSql.sponsor_update,
      programDataArray // <--- 이 배열이 쿼리의 Placeholder(?)에 순서대로 바인딩됨
    );
    console.log("[ programUpdateSQL.js || 프로그램 업데이트 쿼리 성공 ]");
    return sponsorRows;
  } catch (err) {
    console.error(
      "[ programUpdateSQL.js || 프로그램 업데이트 쿼리 실패 ]",
      err.message
    );
    throw err;
  } finally {
    if (sponsorConn) sponsorConn.release();
  }
}

async function programSearch(programCode) {
  let sponsorConn;
  try {
    sponsorConn = await pool.getConnection();
    const sponsorRows = await sponsorConn.query(
      sponsorSql.sponsor_search,
      [programCode] // 단건 조회이므로 program_code만 배열로 전달
    );
    console.log("[ sponsorConn.js || 프로그램 단건 조회 쿼리 성공 ]");
    return sponsorRows;
  } catch (err) {
    console.error(
      "[ sponsorConn.js || 프로그램 단건 조회 쿼리 실패 ]",
      err.message
    );
    throw err;
  } finally {
    if (sponsorConn) sponsorConn.release();
  }
}

// [추가] 조건 검색을 처리하는 함수를 추가합니다.
async function programSearchCondition(searchParams) {
  let sponsorConn;
  console.log("Mapper 조건 검색 파라미터:", searchParams);
  try {
    sponsorConn = await pool.getConnection();
    // 쿼리와 함께 파라미터 객체를 전달하여 MariaDB의 Named Parameter를 사용합니다.
    // (단, 쿼리에서 'where AND ('로 시작하는 부분은 쿼리 문법에 오류가 있을 수 있으니 서버 측에서 조정이 필요할 수 있습니다.)
    const sponsorRows = await sponsorConn.query(
      sponsorSql.sponsor_search_condition,
      searchParams // <--- 이 객체가 쿼리의 :paramName에 바인딩됩니다.
    );
    console.log("[ sponsorConn.js || 프로그램 조건 조회 쿼리 성공 ]");
    return sponsorRows;
  } catch (err) {
    console.error(
      "[ sponsorConn.js || 프로그램 조건 조회 쿼리 실패 ]",
      err.message
    );
    throw err;
  } finally {
    if (sponsorConn) sponsorConn.release();
  }
}

module.exports = {
  sponsorSQL,
  programAddSQL,
  programSearch,
  programSearchCondition,
  programUpdateSQL,
};
