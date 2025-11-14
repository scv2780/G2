// server/sql/counselSql.js
module.exports = {
  /**
   * 담당자(role=2)용 상담 목록
   * - survey_submission, users(작성자/담당자), counsel_note 조인
   * - assi_by = ? 조건
   */
  listCounselByAssignee: `
  SELECT
    ss.submit_code,
    writer.name AS writer_name,
    assi.name   AS assi_name,
    ss.submit_at,
    cd.counsel_date,
    cn.written_at AS note_created_at,
    cn.status AS status
  FROM survey_submission ss
  JOIN users writer
    ON writer.user_code = ss.written_by
  LEFT JOIN users assi
    ON assi.user_code = ss.assi_by

  /* 🔥 상담(note)이 없는 제출은 목록에서 제외 */
  JOIN counsel_note cn
    ON cn.submit_code = ss.submit_code

  /* 🔥 상담(detail)이 없는 경우 무시하고 싶으면 INNER JOIN,  
     임시저장 상태에서도 detail이 없을 수 있으므로 LEFT JOIN 유지 */
  LEFT JOIN (
    SELECT
      counsel_code,
      MIN(counsel_date) AS counsel_date
    FROM counsel_detail
    GROUP BY counsel_code
  ) cd
    ON cd.counsel_code = cn.counsel_code

  WHERE ss.assi_by = ?
  ORDER BY ss.submit_code
`,

  // 관리자 / 시스템용
  listCounselAll: `
  SELECT
    ss.submit_code,
    writer.name AS writer_name,
    assi.name   AS assi_name,
    ss.submit_at,
    cd.counsel_date,
    cn.written_at AS note_created_at,
    cn.status AS status
  FROM survey_submission ss
  JOIN users writer
    ON writer.user_code = ss.written_by
  LEFT JOIN users assi
    ON assi.user_code = ss.assi_by

  /* 🔥 상담이 존재하는 제출만 목록에 표시 */
  JOIN counsel_note cn
    ON cn.submit_code = ss.submit_code

  LEFT JOIN (
    SELECT
      counsel_code,
      MIN(counsel_date) AS counsel_date
    FROM counsel_detail
    GROUP BY counsel_code
  ) cd
    ON cd.counsel_code = cn.counsel_code

  ORDER BY ss.submit_code
`,

  // 상담 존재 여부
  getCounselBySubmit: `
    SELECT * FROM counsel_note WHERE submit_code = ?
  `,

  // 상담 메인 INSERT
  insertCounselNote: `
    INSERT INTO counsel_note (
      submit_code, status, written_at
    )
    VALUES (?, ?, ?)
  `,

  // 상담 메인 UPDATE
  updateCounselNote: `
    UPDATE counsel_note
    SET status = ?, written_at = ?
    WHERE counsel_code = ?
  `,

  //상담 재수정
  updateCounselNoteKeepStatus: `
  UPDATE counsel_note
  SET status = 'CB6', written_at = ?
  WHERE counsel_code = ?
`,

  // 상담 상세 삭제
  deleteCounselDetails: `
    DELETE FROM counsel_detail WHERE counsel_code = ?
  `,

  // 상담 상세 INSERT
  insertCounselDetail: `
    INSERT INTO counsel_detail (
      counsel_code, counsel_date, title, content, attach_code
    ) VALUES (?, ?, ?, ?, ?)
  `,

  // 우선순위 초기화
  resetPriority: `
    UPDATE case_priority
    SET is_current = 'N'
    WHERE submit_code = ?
  `,

  // 우선순위 등록
  insertPriority: `
    INSERT INTO case_priority (submit_code, level, is_current)
    VALUES (?, ?, ?)
  `,

  /* ✅ 상담 상세 조회용 헤더 */
  getCounselHeaderBySubmit: `
    SELECT
      cn.counsel_code,
      cn.submit_code,
      cn.status,
      cn.written_at,
      ss.submit_at,
      writer.name AS writer_name,
      LEFT(writer.ssn, 6) AS ssn_front
    FROM counsel_note cn
    JOIN survey_submission ss
      ON ss.submit_code = cn.submit_code
    JOIN users writer
      ON writer.user_code = ss.written_by
    WHERE cn.submit_code = ?
    LIMIT 1
  `,

  /* ✅ 상담 상세들 */
  getCounselDetailsByCounsel: `
    SELECT
      detail_code,
      counsel_code,
      counsel_date,
      title,
      content,
      attach_code
    FROM counsel_detail
    WHERE counsel_code = ?
    ORDER BY counsel_date ASC, detail_code ASC
  `,

  /* ✅ 현재 우선순위 */
  getCurrentPriorityBySubmit: `
    SELECT level
    FROM case_priority
    WHERE submit_code = ?
      AND is_current = 'Y'
    ORDER BY priority_code DESC
    LIMIT 1
  `,
  // 상담 승인요청 등록
  insertRequestApproval: `
  INSERT INTO request_approval (
    requester_code,
    processor_code,
    approval_type,
    request_date,
    approval_date,
    state,
    rejection_reason,
    linked_table_name,
    linked_record_pk
  ) VALUES (
    ?,           -- requester_code
    ?,           -- processor_code
    ?,           -- approval_type
    CURDATE(),   -- request_date (오늘)
    NULL,        -- approval_date
    ?,           -- state
    NULL,        -- rejection_reason
    ?,           -- linked_table_name
    ?            -- linked_record_pk
  )
`,

  // 상담 승인요청 → 승인(BA2)
  updateApprovalApprove: `
  UPDATE request_approval
  SET
    state = 'BA2',          -- 승인
    approval_date = CURDATE(),
    rejection_reason = NULL
  WHERE linked_table_name = 'counsel_note'
    AND linked_record_pk = ?
    AND approval_type = 'AE3'
    AND state = 'BA1'
`,

  // 승인 시 counsel_note 상태 → CB5(검토완료)
  updateCounselNoteApprove: `
  UPDATE counsel_note
  SET status = 'CB5'
  WHERE counsel_code = ?
`,

  // 상담 승인요청 → 반려(BA3)
  updateApprovalReject: `
  UPDATE request_approval
  SET
    state = 'BA3',          -- 반려
    approval_date = CURDATE(),
    rejection_reason = ?
  WHERE linked_table_name = 'counsel_note'
    AND linked_record_pk = ?
    AND approval_type = 'AE3'
    AND state = 'BA1'
`,

  // 반려 시 counsel_note 상태 → CB4 (반려로 사용할게오)
  updateCounselNoteReject: `
  UPDATE counsel_note
  SET status = 'CB4'
  WHERE counsel_code = ?
`,

  //  특정 상담(counsel_code)에 대한 반려 사유 조회
  getRejectReasonByCounsel: `
  SELECT
    rejection_reason
  FROM request_approval
  WHERE linked_table_name = 'counsel_note'
    AND linked_record_pk = ?
    AND approval_type = 'AE3'
    AND state = 'BA3'      -- 반려 상태
  ORDER BY
    approval_date DESC,
    request_date DESC,
    approval_code DESC
  LIMIT 1
`,

  // 임시저장 시 상태를 CB1으로
  updateCounselNoteTemp: `
  UPDATE counsel_note
  SET status = ?, written_at = ?
  WHERE counsel_code = ?
`,

  // 🔹 첨부파일 INSERT
  insertAttachment: `
    INSERT INTO attachment (
      original_filename,
      server_filename,
      file_path,
      linked_table_name,
      linked_record_pk
    ) VALUES (?, ?, ?, ?, ?)
  `,

  // 🔹 특정 상담에 묶인 첨부파일 모두 삭제 (필요시 사용, 지금 로직에서는 안 써도 됨)
  deleteAttachmentsByCounsel: `
    DELETE FROM attachment
    WHERE linked_table_name = 'counsel_note'
      AND linked_record_pk = ?
  `,

  // 🔹 특정 상담에 묶인 첨부파일 "한 건"만 삭제 (지금 saveCounsel에서 사용하는 쿼리)
  deleteAttachmentOne: `
    DELETE FROM attachment
    WHERE linked_table_name = 'counsel_note'
      AND linked_record_pk = ?
      AND attach_code = ?
  `,

  // 🔹 특정 상담(counsel_note)에 연결된 첨부파일 목록
  getAttachmentsByCounsel: `
    SELECT
      attach_code,
      original_filename,
      server_filename,
      file_path
    FROM attachment
    WHERE linked_table_name = 'counsel_note'
      AND linked_record_pk = ?
    ORDER BY attach_code
  `,

  // 🔹 submit_code로 survey_submission의 assi_by 조회
  getAssigneeBySubmit: `
    SELECT assi_by
    FROM survey_submission
    WHERE submit_code = ?
    LIMIT 1
  `,

  // 🔹 해당 submit_code로 이미 support_plan이 있는지 확인
  getSupportPlanBySubmit: `
    SELECT *
    FROM support_plan
    WHERE submit_code = ?
    LIMIT 1
  `,

  // 🔹 support_plan 기본 INSERT
  insertSupportPlan: `
    INSERT INTO support_plan (
      submit_code,
      status,
      assi_by
    ) VALUES (?, ?, ?)
  `,
};
