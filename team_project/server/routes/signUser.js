const express = require('express');
const router = express.Router();
const userService = require('../services/signUserService');

// 중복 확인
router.get('/checkid', async (req, res) => {
  const userId = req.query.id;
  try {
    const result = await userService.checkId(userId);
    res.json(result);
  } catch (err) {
    console.error('[ authUser.js -> checkid 라우터 오류 ]', err);
    res
      .status(500)
      .json({ ok: false, message: '[ authUser.js -> checkid 오류 ]' });
  }
});

// 개인 회원가입
router.post('/addUser', async (req, res) => {
  try {
    const result = await userService.addUser(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, message: '[ signUser.js 회원가입 실패 ]' });
  }
});

// 기관 회원가입
router.post('/addOrg', async (req, res) => {
  try {
    const result = await userService.addOrg(req.body);
    res.json(result);
  } catch (err) {
    console.error('[ authUser.js -> addOrg 라우터 오류 ]', err);
    res
      .status(500)
      .json({ ok: false, message: '[ signUser.js 회원가입 실패 ]' });
  }
});

// 회원가입
router.post('/login', async (req, res) => {
  try {
    const result = await userService.login(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: '[ signUser.js 로그인 실패 ]' });
  }
});
module.exports = router;
