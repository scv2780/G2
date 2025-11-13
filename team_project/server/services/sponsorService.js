const sponsorMapper = require("../mappers/sponsorMapper.js");

// 전체 목록 조회 또는 조건부 조회
async function sponsorUsersList(searchParams = {}) {
  let sponsorFindDB;

  //  파라미터 객체가 비어있지 않으면 조건 검색을 실행합니다.
  if (Object.keys(searchParams).length > 0) {
    sponsorFindDB = await sponsorMapper.programSearchCondition(searchParams);
  } else {
    // 파라미터가 없으면 전체 목록 조회
    sponsorFindDB = await sponsorMapper.sponsorSQL();
  }
  return sponsorFindDB;
}

// 단건 조회
async function sponsorUsers(programCode) {
  //  programCode를 인수로 받습니다.
  const sponsorFindDB = await sponsorMapper.programSearch(programCode); // programSearch로 변경
  return sponsorFindDB;
}
// 프로그램 등록
async function sponsorProgramAdd(clientData) {
  // DB 쿼리의 Placeholder(?) 순서에 맞게 데이터 배열을 생성해야 합니다.
  // 쿼리 순서 (server/spq/sponsorSql.js):
  // 1.program_name, 2.sponsor_type, 3.status, 4.start_date, 5.end_date,
  // 6.donation_type, 7.donation_unit, 8.goal_amount, 9.current_amount,
  // 10.writer, 11.create_date, 12.approval_status
  console.log("클라이언트 데이터");
  console.log(clientData);
  // 클라이언트(Vue)에서 이미 이 순서에 맞게 필드를 정리하여 전송했으므로,
  // 객체의 값들을 순서대로 추출하여 배열을 만듭니다.
  const programDataArray = [
    clientData.program_name,
    clientData.sponsor_type,
    clientData.status,
    clientData.start_date, // (4) Vue에서 현재 날짜로 설정되어 넘어옴
    clientData.end_date, // (5) Vue에서 null로 설정되어 넘어옴
    clientData.donation_type, // (6) Vue에서 '지정'/'자율'로 설정되어 넘어옴
    clientData.donation_unit, // (7) Vue에서 '/' 구분자 문자열 또는 null로 설정되어 넘어옴
    clientData.goal_amount, // (8) Vue에서 순수 숫자로 설정되어 넘어옴
    clientData.current_amount, // (9) Vue에서 0으로 설정되어 넘어옴
    clientData.writer, // (10) Vue에서 'admin' 등 임시값으로 설정되어 넘어옴
    clientData.create_date, // (11) Vue에서 현재 날짜로 설정되어 넘어옴
    clientData.approval_status, // (12) Vue에서 '승인전'으로 설정되어 넘어옴
  ];

  // console.log(
  //   "Service Layer | DB 삽입을 위한 최종 데이터 배열:",
  //   programDataArray
  // );

  // 배열화된 데이터를 매퍼로 전달하여 쿼리 실행
  const sponsorInsertResult = await sponsorMapper.programAddSQL(
    programDataArray
  );

  return sponsorInsertResult;
}

//프로그램 업데이트
async function sponsorProgramUpdate(clientData) {
  console.log("클라이언트 데이터");
  console.log(clientData);
  const programDataArray = [
    clientData.program_name,
    clientData.sponsor_type,
    clientData.status,
    clientData.start_date, // (4) Vue에서 현재 날짜로 설정되어 넘어옴
    clientData.end_date, // (5) Vue에서 null로 설정되어 넘어옴
    clientData.donation_type, // (6) Vue에서 '지정'/'자율'로 설정되어 넘어옴
    clientData.donation_unit, // (7) Vue에서 '/' 구분자 문자열 또는 null로 설정되어 넘어옴
    clientData.goal_amount, // (8) Vue에서 순수 숫자로 설정되어 넘어옴
    clientData.approval_status, // (12) Vue에서 '승인전'으로 설정되어 넘어옴
    clientData.program_code,
  ];

  const sponsorInsertResult = await sponsorMapper.programUpdateSQL(
    programDataArray
  );

  return sponsorInsertResult;
}

module.exports = {
  sponsorUsersList,
  sponsorProgramAdd,
  sponsorUsers,
  sponsorProgramUpdate,
};
