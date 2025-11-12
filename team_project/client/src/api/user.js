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
// export async function registerUser(userData) {
//   try {

//   } catch (error) {
//     console.log('회원가입 실패', error)
//     throw error;
//   }
// }
