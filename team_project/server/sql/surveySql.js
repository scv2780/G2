// 목록
const selectSurveyList = `
  SELECT *
  FROM survey_template
  ORDER BY template_code DESC
`;

// 최신(is_current='Y') 버전 1건
const selectCurrentTemplateVer = `
  SELECT tv.template_ver_code, t.template_code, t.version_no
  FROM survey_template_ver tv
  JOIN survey_template t ON t.template_code = tv.template_code
  WHERE tv.is_current = 'Y'
  ORDER BY tv.template_ver_code DESC
  LIMIT 1
`;

// 특정 버전의 전체 구조 (섹션-서브섹션-아이템)
const selectStructureByTemplateVer = `
  SELECT
    s.section_code, s.section_title, s.section_desc,
    ss.subsection_code, ss.subsection_title, ss.subsection_desc,
    i.item_code, i.question_type, i.question_text, i.is_required
  FROM survey_section s
  LEFT JOIN survey_subsection ss ON ss.section_code = s.section_code
  LEFT JOIN survey_item i ON i.subsection_code = ss.subsection_code
  WHERE s.template_ver_code = ?
  ORDER BY s.section_code, ss.subsection_code, i.item_code
`;

// ✅ 제출본 생성 (survey_submission)
const insertSurveySubmission = `
  INSERT INTO survey_submission
    (template_ver_code, submit_at, updated_at, written_by, assi_by, app_by, status, app_at)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?)
`;

// ✅ 답변 저장 (survey_answer)
const insertSurveyAnswer = `
  INSERT INTO survey_answer
    (item_code, submit_code, answer_text, created_at)
  VALUES
    (?, ?, ?, ?)
`;

module.exports = {
  selectSurveyList,
  selectCurrentTemplateVer,
  selectStructureByTemplateVer,
  insertSurveySubmission,
  insertSurveyAnswer,
  // (기존 목록/버전 생성 쿼리 등도 그대로 export)
};
