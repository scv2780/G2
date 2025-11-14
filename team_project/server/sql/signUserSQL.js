const FIND_ID = 'SELECT user_id FROM users WHERE user_id = ?';

const AUTH_LOGIN = `
  SELECT user_id, 
         role
  FROM users
  WHERE user_id = ?
  AND password_hash = ?
`;

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

module.exports = {
  FIND_ID,
  AUTH_LOGIN,
  INSERT_USER,
  FIND_ORG_CODE,
  SEARCH_ORG,
};
