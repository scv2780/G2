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
    console.error(err);
    res
      .status(500)
      .json({ ok: false, message: '[ authUser.js -> checkid 오류 ]' });
  }
});

// 회원가입 -> DB로 post
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

router.post('/addOrg', async (req, res) => {
  try {
    const result = await userService.addOrg(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, message: '[ signUser.js 회원가입 실패 ]' });
  }
});

// 기관명 자동 검색
router.get('/searchOrg', async (req, res) => {
  try {
    const keyword = req.query.name;
    const result = await userService.searchOrg(keyword);
    res.json(result);
  } catch (err) {
    console.error('[ searchOrg 라우터 오류 ]', err);
    res
      .status(500)
      .json({ ok: false, message: '[ signUser.js 기관 검색 실패 ]' });
  }
});

module.exports = router;
