const supportPlanMapper = require("../mappers/supportPlanMapper.js");

module.exports = {
  listPlans(role, userId) {
    return supportPlanMapper.listSupportPlansByRole(
      Number(role),
      Number(userId)
    );
  },
};
