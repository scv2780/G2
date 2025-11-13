import axios from 'axios';

// 회원가입 -> ID 중복 확인
export async function checkId(id) {
  try {
    const res = await axios.get(`/api/user/checkid`, { params: { id } });
    return res.data;
  } catch (error) {
    console.log('에러 발생', error);
    throw error;
  }
}

// 회원가입 -> 개인 회원
export async function addUser(userData) {
  try {
    const res = await axios.post('/api/user/addUser', userData);
    return res.data;
  } catch (error) {
    console.log('[ user.js 회원가입 실패 ]', error);
    throw error;
  }
}

// 회원가입 -> 기관 회원
export async function addOrg(orgData) {
  try {
    const res = await axios.post('/api/user/addOrg', orgData);
    return res.data;
  } catch (error) {
    console.log('[ user.js 회원가입 실패 ]', error);
    throw error;
  }
}
