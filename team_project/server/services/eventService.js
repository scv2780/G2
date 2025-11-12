const eventMapper = require("../mappers/eventMapper");

// 전체 목록 조회 test
async function eventList() {
  const eventFindDB = await eventMapper.eventListSQL();
  return eventFindDB;
}

module.exports = { eventList };
