const approvalMapper = require("../mappers/approvalMapper");
const mailer = require("../utils/mailer");

/** ✅ 승인 목록 조회 */
async function managerApprovalList({ state, keyword, page, size }) {
  return await approvalMapper.managerApprovalList({
    state,
    keyword,
    page,
    size,
  });
}

/** ✅ 승인 + 승인 메일 발송 */
async function approve({ approvalCode }) {
  // 1) 상태 BA2(승인)로 변경 + 사용자 활성화 (mapper에서 처리)
  const result = await approvalMapper.updateApprovalState({
    approvalCode,
    nextState: "BA2",
  });

  if (!result.affectedRows) {
    // 변경된 행 없으면 메일도 안 보냄
    return result;
  }

  // 2) 요청자 정보 조회
  const info = await approvalMapper.findApprovalWithUser({ approvalCode });

  if (info && info.email) {
    try {
      await mailer.sendApproveMail({
        to: info.email,
        name: info.user_name || info.name,
        approvalCode,
      });
      console.log("[approvalService] approve mail sent to", info.email);
    } catch (err) {
      console.error("[approvalService] approve mail send error:", err);
      // 메일 실패해도 승인/role 변경은 성공이므로 throw 안 함
    }
  }

  return result;
}

/** ✅ 반려 + 메일 발송 */
async function reject({ approvalCode, reason }) {
  // 1) 상태를 BA3(반려)로 변경
  const result = await approvalMapper.updateApprovalState({
    approvalCode,
    nextState: "BA3",
  });

  // 변경된 행 없으면 메일도 안 보냄
  if (!result.affectedRows) {
    return result;
  }

  // 2) 요청자 정보 조회 (이메일, 이름 등)
  const info = await approvalMapper.findApprovalWithUser({ approvalCode });

  if (info && info.email) {
    try {
      await mailer.sendRejectMail({
        to: info.email,
        name: info.user_name || info.name,
        approvalCode,
        reason: reason || "",
      });
      console.log("[approvalService] reject mail sent to", info.email);
    } catch (err) {
      console.error("[approvalService] reject mail send error:", err);
      // 메일 실패해도 승인(반려) 자체는 성공이므로 throw 안 함
    }
  }

  return result;
}

/** ✅ 기관 담당자 승인 목록 (AE2) */
async function staffApprovalList({ state, keyword, page, size }) {
  return await approvalMapper.staffApprovalList({
    state,
    keyword,
    page,
    size,
  });
}

/** ✅ 기관 담당자 승인 (is_active 활성화 + 메일 발송) */
async function approveStaff({ approvalCode }) {
  const result = await approvalMapper.updateApprovalStateForStaff({
    approvalCode,
    nextState: "BA2",
  });

  // 승인 자체가 안 되었으면 메일도 안 보냄
  if (!result.affectedRows) {
    return result;
  }

  // 요청자 정보 조회 (이메일, 이름)
  const info = await approvalMapper.findApprovalWithUser({ approvalCode });

  if (info && info.email) {
    try {
      await mailer.sendStaffApproveMail({
        to: info.email,
        name: info.user_name || info.name,
        approvalCode,
      });
      console.log("[approvalService] staff approve mail sent to", info.email);
    } catch (err) {
      console.error("[approvalService] staff approve mail send error:", err);
      // 여기서 throw 하면 승인 자체가 실패한 것처럼 보이니까, 로그만 찍고 넘어간다
    }
  }

  return result;
}

/** ✅ 기관 담당자 반려 (BA3 + 메일 발송) */
async function rejectStaff({ approvalCode, reason }) {
  const result = await approvalMapper.updateApprovalStateForStaff({
    approvalCode,
    nextState: "BA3",
  });

  if (!result.affectedRows) {
    return result;
  }

  const info = await approvalMapper.findApprovalWithUser({ approvalCode });

  if (info && info.email) {
    try {
      await mailer.sendStaffRejectMail({
        to: info.email,
        name: info.user_name || info.name,
        approvalCode,
        reason: reason || "",
      });
      console.log("[approvalService] staff reject mail sent to", info.email);
    } catch (err) {
      console.error("[approvalService] staff reject mail send error:", err);
    }
  }

  return result;
}

module.exports = {
  managerApprovalList,
  approve,
  reject,
  staffApprovalList,
  approveStaff,
  rejectStaff,
};
