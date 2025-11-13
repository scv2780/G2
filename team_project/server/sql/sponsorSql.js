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

//단건 조회
const sponsor_search = `select
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
 from support_program
 where program_code = ?`;

//조건 조회
const sponsor_search_condition = `select
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
     from support_program
     where 1=1  WHERE
    ( (:programCode = '' OR :programCode IS NULL) OR program_code = :programCode )
or
    ( (:sponsorType = '' OR :sponsorType IS NULL) OR sponsor_type = :sponsorType )
or
    ( (:status = '' OR :status IS NULL) OR status = :status )
or
    ( (:amount IS NULL) OR goal_amount >= :amount )
or 
    ( (:startDate = '' OR :startDate IS NULL OR :endDate = '' OR :endDate IS NULL) 
        OR (start_date <= :endDate AND end_date >= :startDate) 
    )
 `;
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
    program_name = ?,
    sponsor_type = ?,
    status = ?,
    start_date = ?,
    end_date = ?,
    donation_type = ?,
    donation_unit = ?,
    goal_amount = ?,
    approval_status = ?
    where program_code = ?
`;

module.exports = {
  sponsor_all,
  sponsor_program,
  sponsor_search,
  sponsor_search_condition,
  sponsor_update,
};
