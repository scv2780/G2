const express = require('express');
const router = express.Router();
const userService = require('../services/authUserService');

// 중복 확인
router.get('/checkid', async (req, res) => {
  const userId = req.query.id;
  try {
    const result = await userService.checkId(userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: '[ authUser.js 오류 ]' });
  }
});

module.exports = router;
