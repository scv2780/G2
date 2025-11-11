const express = require("express");
const router = express.Router();
const { sponsorUsersList } = require("../services/sponsorServer.js");

router.get("/", async (req, res) => {
  try {
    const serviceSponsor = await sponsorUsersList();
    console.log(serviceSponsor);
    console.log("[ serviceSponsor.js || routeServiceTest 성공]");
    res.status(200).json({
      status: "success",
      serviceSponsor,
    });
  } catch (err) {
    console.error("[ serviceSponsor.js || routeServiceTest 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "에러 발생",
    });
  }
});

module.exports = router;
