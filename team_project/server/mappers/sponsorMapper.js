const pool = require("../configs/db.js");
const sponsorSql = require("../sql/sponsorSql.js");

async function sponsorSQL() {
  let sponsorConn;
  try {
    sponsorConn = await pool.getConnection();
    const sponsorRows = await sponsorConn.query(sponsorSql.sponsor_all);
    console.log("[ sponsorConn.js || 성공 ]");
    console.log(sponsorRows);
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
    //  쿼리와 함께 데이터 배열을 두 번째 인수로 전달
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

  // 1. 기본 쿼리 및 위치 지정자 배열 초기화
  let sql = `SELECT 
        program_code, program_name, sponsor_type, status, start_date, end_date, 
        donation_type, donation_unit, goal_amount, current_amount, writer, 
        create_date, approval_status 
        FROM support_program WHERE 1=1`;

  const params = [];

  // 2. 프로그램 코드
  if (searchParams.programCode && searchParams.programCode !== "") {
    sql += ` AND program_code = ?`;
    params.push(searchParams.programCode);
  }

  // 3. 후원 방법
  if (searchParams.sponsorType && searchParams.sponsorType !== "") {
    sql += ` AND sponsor_type = ?`;
    params.push(searchParams.sponsorType);
  }

  // 4. 승인 상태 (status)
  if (searchParams.status && searchParams.status !== "") {
    sql += ` AND status = ?`;
    params.push(searchParams.status);
  }

  // *주의: Vue에서 'approval_status'를 보내지만, 검색 필드는 'status'를 사용합니다.
  // 백엔드 파라미터에 'approval_status'가 있다면 처리 로직을 추가합니다.
  if (searchParams.approval_status && searchParams.approval_status !== "") {
    sql += ` AND approval_status = ?`;
    params.push(searchParams.approval_status);
  }

  // 5. 날짜 범위
  // Vue에서는 빈 문자열 ''로 오기 때문에 빈 문자열을 검사해야 합니다.
  if (
    searchParams.startDate &&
    searchParams.startDate !== "" &&
    searchParams.endDate &&
    searchParams.endDate !== ""
  ) {
    sql += ` AND start_date <= ? AND end_date >= ?`;
    params.push(searchParams.endDate); // 날짜 범위 조건
    params.push(searchParams.startDate);
  }

  console.log("동적 쿼리 생성:", sql);
  console.log("동적 파라미터 배열:", params);

  try {
    sponsorConn = await pool.getConnection();
    const sponsorRows = await sponsorConn.query(
      sql,
      params // <--- 위치 지정자 (?)에 배열을 전달합니다.
    );
    console.log("[ sponsorConn.js || 프로그램 동적 조회 쿼리 성공 ]");
    return sponsorRows;
  } catch (err) {
    console.error(
      "[ sponsorConn.js || 프로그램 동적 조회 쿼리 실패 ]",
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
