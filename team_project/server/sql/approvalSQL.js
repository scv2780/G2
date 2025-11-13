// team_project/server/sql/approvalSQL.js

//** ✅ 기관 관리자 승인 요청 목록 조회 쿼리 */
const managerApprovalList = `
SELECT
    ra.approval_code,           
    u.name        AS user_name, 
    u.user_id     AS login_id,  
    o.org_name    AS organization_name, 
    u.phone,
    u.email,
    ra.state,                   
    ra.request_date,
    ra.approval_date
FROM request_approval ra
JOIN users u
  ON u.user_code = ra.requester_code
LEFT JOIN organization o
  ON o.org_code = u.org_code    
WHERE ra.approval_type = 'AE1'
  -- 상태 필터 (전체면 무시)
  AND (? = '' OR ra.state = ?)
  -- 검색어 필터 (전체면 무시)
  AND (
    ? = '' OR
    u.name        LIKE CONCAT('%', ?, '%') OR
    u.user_id     LIKE CONCAT('%', ?, '%') OR
    o.org_name    LIKE CONCAT('%', ?, '%') OR
    u.phone       LIKE CONCAT('%', ?, '%') OR
    u.email       LIKE CONCAT('%', ?, '%')
  )
ORDER BY ra.request_date DESC, ra.approval_code DESC
LIMIT ?, ?
`;

/** ✅ 승인/반려 공통 업데이트 쿼리 */
const updateApprovalState = `
  UPDATE request_approval
     SET state = ?,
         approval_date = NOW()
   WHERE approval_code = ?
     AND state = 'BA1'   -- 요청 상태일 때만 변경
`;

const findApprovalWithUser = `
  SELECT
    ra.approval_code,
    ra.state,
    u.user_code,
    u.name        AS user_name,
    u.email
  FROM request_approval ra
  JOIN users u
    ON u.user_code = ra.requester_code
  WHERE ra.approval_code = ?
`;

// ✅ 기관 담당자 승인 요청 목록 조회 (approval_type = 'AE2')
const staffApprovalList = `
SELECT
    ra.approval_code,
    u.name        AS user_name,
    u.user_id     AS login_id,
    o.org_name    AS organization_name,
    u.phone,
    u.email,
    ra.state,
    ra.request_date,
    ra.approval_date
FROM request_approval ra
JOIN users u
  ON u.user_code = ra.requester_code
LEFT JOIN organization o
  ON o.org_code = u.org_code
WHERE ra.approval_type = 'AE2'
  -- 상태 필터 (전체면 무시)
  AND (? = '' OR ra.state = ?)
  -- 검색어 필터 (전체면 무시)
  AND (
    ? = '' OR
    u.name        LIKE CONCAT('%', ?, '%') OR
    u.user_id     LIKE CONCAT('%', ?, '%') OR
    o.org_name    LIKE CONCAT('%', ?, '%') OR
    u.phone       LIKE CONCAT('%', ?, '%') OR
    u.email       LIKE CONCAT('%', ?, '%')
  )
ORDER BY ra.request_date DESC, ra.approval_code DESC
LIMIT ?, ?
`;

/** ✅ 승인 시, 요청자 계정 활성화 (is_active = 1) */
const activateUserByApproval = `
  UPDATE users u
  JOIN request_approval ra
    ON ra.requester_code = u.user_code
   SET u.is_active = 1
 WHERE ra.approval_code = ?
`;

module.exports = {
  managerApprovalList,
  updateApprovalState,
  findApprovalWithUser,
  staffApprovalList,
  activateUserByApproval,
};
