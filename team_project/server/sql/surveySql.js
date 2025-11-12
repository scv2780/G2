module.exports = {
  // 목록
  listTemplates: `
    SELECT template_code, version_no, status, created_by, created_at
    FROM survey_template
    ORDER BY template_code DESC
  `,

  // 생성
  insertTemplate: `
    INSERT INTO survey_template (version_no, status, created_by, created_at)
    VALUES (?, ?, ?, ?)
  `,
  insertTemplateVer: `
    INSERT INTO survey_template_ver (
      template_code, version_detail_no, effective_from, effective_to,
      is_current, created_by, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  insertSection: `
    INSERT INTO survey_section (template_ver_code, section_title, section_desc)
    VALUES (?, ?, ?)
  `,
  insertSubsection: `
    INSERT INTO survey_subsection (section_code, subsection_title, subsection_desc)
    VALUES (?, ?, ?)
  `,
  insertItem: `
    INSERT INTO survey_item (
      subsection_code, question_type, question_text, is_required, option_values
    )
    VALUES (?, ?, ?, ?, ?)
  `,

  // ✅ 최신 템플릿 버전 찾기
  getLatestTemplateVer: `
    SELECT template_ver_code, template_code, version_detail_no
    FROM survey_template_ver
    WHERE is_current = 'Y'
    ORDER BY effective_from DESC, template_ver_code DESC
    LIMIT 1
  `,

  // ✅ 해당 버전의 섹션/서브섹션/아이템
  getSectionsByVer: `
    SELECT section_code, section_title, section_desc
    FROM survey_section
    WHERE template_ver_code = ?
    ORDER BY section_code
  `,
  getSubsectionsByVer: `
    SELECT sub.subsection_code, sub.section_code, sub.subsection_title, sub.subsection_desc
    FROM survey_subsection sub
    JOIN survey_section sec ON sec.section_code = sub.section_code
    WHERE sec.template_ver_code = ?
    ORDER BY sub.subsection_code
  `,
  getItemsByVer: `
    SELECT itm.item_code, sub.subsection_code, itm.question_type, itm.question_text, itm.is_required, itm.option_values
    FROM survey_item itm
    JOIN survey_subsection sub ON sub.subsection_code = itm.subsection_code
    JOIN survey_section sec ON sec.section_code = sub.section_code
    WHERE sec.template_ver_code = ?
    ORDER BY itm.item_code
  `,

  // ✅ 제출/답변 저장
  insertSubmission: `
    INSERT INTO survey_submission (
      template_ver_code, submit_at, updated_at, written_by, status, app_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,
  insertAnswer: `
    INSERT INTO survey_answer (item_code, submit_code, answer_text, created_at)
    VALUES (?, ?, ?, ?)
  `,
};
