//전체 조회
const sponsor_all = `select 
  program_code,
	program_name,
    sponsor_type,
    status,
    start_date,
    end_date,
    donation_type,
    donation_unit,
    goal_amount,
    current_amount,
    writer,
    create_date,
    approval_status
 from support_program`;

//조건 조회
const sponsor_search = `select 
	  program_name,
    sponsor_type,
    start_date,
    end_date,
    goal_amount,
    approval_status
 from support_program`;

//등록
const sponsor_program = `
  insert into support_program  (
    program_name,
    sponsor_type,
    status,
    start_date,
    end_date,
    donation_type,
    donation_unit,
    goal_amount,
    current_amount,
    writer,
    create_date,
    approval_status
)    
values (?,?,?,?,?,?,?,?,?,?,?,?)
 `;

//수정
const sponsor_update = `
  update support_program set
  

`;

module.exports = {
  sponsor_all,
  sponsor_program,
};
