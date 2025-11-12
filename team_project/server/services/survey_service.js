const mysql = require('../mappers/survey_mapper.js');

const findAll = async () => {
  try {
    const list = await mysql.query('selectSurveyList');
    return list;
  } catch (err) {
    console.log(err);
    return { err: 'DB조회 중 오류 발생' };
  }
};

module.exports = { findAll, create };
