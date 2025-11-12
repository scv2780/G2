// team_project/server/sql/approvalSQL.js
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
JOIN users u         ON u.user_code = ra.requestor_code
LEFT JOIN organization o ON o.org_code = u.org_code    
WHERE ra.approval_type = 'ORG_MANAGER'   
ORDER BY ra.request_date DESC
`;

module.exports = {
  managerApprovalList,
};
