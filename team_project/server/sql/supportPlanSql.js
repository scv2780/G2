module.exports = {
  // 역할 상관없이 전체 목록 (관리자/시스템용)
  listSupportPlanAll: `
    SELECT
      sp.plan_code,
      sp.submit_code,
      sp.status,
      sp.written_at,
      ss.submit_at,
      writer.name AS writer_name,
      assi.name   AS assi_name
    FROM support_plan sp
    JOIN survey_submission ss
      ON ss.submit_code = sp.submit_code
    JOIN users writer
      ON writer.user_code = ss.written_by
    LEFT JOIN users assi
      ON assi.user_code = sp.assi_by
    ORDER BY sp.plan_code DESC
  `,

  // 담당자용: 내가 담당자인 것만
  listSupportPlanByAssignee: `
    SELECT
      sp.plan_code,
      sp.submit_code,
      sp.status,
      sp.written_at,
      ss.submit_at,
      writer.name AS writer_name,
      assi.name   AS assi_name
    FROM support_plan sp
    JOIN survey_submission ss
      ON ss.submit_code = sp.submit_code
    JOIN users writer
      ON writer.user_code = ss.written_by
    LEFT JOIN users assi
      ON assi.user_code = sp.assi_by
    WHERE sp.assi_by = ?
    ORDER BY sp.plan_code DESC
  `,
};
