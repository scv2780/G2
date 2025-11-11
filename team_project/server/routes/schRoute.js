const express = require("express");
const router = express.Router();
const { schService } = require("../services/schService");

router.get("/", async (req, res) => {
  try {
    const service = await schService();
    console.log(service);
    console.log("[ testRoute.js || routeServiceTest 성공]");
    res.status(200).json({
      status: "success",
      service,
    });
  } catch (err) {
    console.error("[ testRoute.js || routeServiceTest 실패]", err.message);
    res.status(500).json({
      status: "error",
      message: "에러 발생",
    });
  }
});

module.exports = router;
