const surveyMapper = require("../mappers/surveyMapper");

module.exports = {
  async listTemplates() {
    return surveyMapper.listTemplates();
  },
  async createSurvey(data) {
    return surveyMapper.insertSurvey(data);
  },

  // ✅ 최신 조사지(트리) 조회
  async getLatestSurvey() {
    return surveyMapper.getLatestSurvey();
  },

  // ✅ 응답 제출
  async submitSurvey(body) {
    // body: { template_ver_code, answers: { [item_code]: value | value[] } , written_by? }
    return surveyMapper.insertAnswers(body);
  },
};
