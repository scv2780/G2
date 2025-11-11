const organizationList = `SELECT org_code
                          ,org_name
                          ,address
                          ,org_phone
                          ,start_date
                          ,end_date
                          ,status
                    FROM users`;

module.exports = { organizationList };
