const FIND_ID = 'SELECT user_id FROM users WHERE user_id = ?';

const INSERT_USER = `
  INSERT INTO users (
    org_code,
    user_id,
    password_hash,
    role,
    name,
    ssn,
    phone,
    address,
    email,
    department, 
    is_active,
    login_fail_count,
    join_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const FIND_ORG_CODE = `
  SELECT org_code
  FROM organization
  WHERE org_name = ?
`;

const SEARCH_ORG = `
  SELECT org_name
  FROM organization
  WHERE org_name LIKE CONCAT('%', ?, '%')
  LIMIT 10
`;

module.exports = { FIND_ID, INSERT_USER, FIND_ORG_CODE, SEARCH_ORG };
