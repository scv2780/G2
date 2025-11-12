const surveyMapper = require("../mappers/surveyMapper");

module.exports = {
  // 버전별 조사지 목록
  listTemplates() {
    return surveyMapper.listTemplates();
  },

  // 조사지 새로 생성
  createSurvey(data) {
    return surveyMapper.insertSurvey(data);
  },

  // 최신 조사지(트리) 조회
  getLatestSurvey() {
    return surveyMapper.getLatestSurvey();
  },

  // 응답 제출
  submitSurvey(body) {
    // body: { template_ver_code, answers: { [item_code]: value | value[] }, written_by? }
    return surveyMapper.insertAnswers(body);
  },

  // 조사지 상세
  getSurveyDetail(templateCode) {
    return surveyMapper.getSurveyDetail(templateCode);
  },

  // 조사지 수정 (버전 업데이트)
  updateSurveyVersion(templateCode, data) {
    return surveyMapper.updateSurveyVersion(templateCode, data);
  },

  // 역할별 조사지 제출 목록
  listSubmissions(role, userId) {
    return surveyMapper.listSubmissionsByRole(Number(role), Number(userId));
  },

  // 제출본 상세보기
  getSubmissionDetail(submitCode) {
    return surveyMapper.getSubmissionDetail(Number(submitCode));
  },

  // 제출본 수정
  updateSubmission(submitCode, body) {
    return surveyMapper.updateSubmissionAnswers(Number(submitCode), body);
  },
};
