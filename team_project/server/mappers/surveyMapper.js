// server/mappers/surveyMapper.js
const pool = require("../configs/db");
const sql = require("../sql/surveySql");

/* -------------------------------------------------
 * 공통 유틸
 * ------------------------------------------------- */
function safeParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
function normalizeOptions(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "object") {
    if (Buffer.isBuffer(val)) return safeParseJSON(val.toString("utf8"));
    return val;
  }
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    return safeParseJSON(s);
  }
  return [];
}
// BigInt → Number (JSON 직렬화 보호)
function safeJSON(v) {
  return JSON.parse(
    JSON.stringify(v, (_, x) => (typeof x === "bigint" ? Number(x) : x))
  );
}

// 수정할 때 ID 제거
function stripIdsForVersioning(payload) {
  const copy = JSON.parse(JSON.stringify(payload || {}));

  // 상위도 혹시 모를 키 제거 (서버에서 insert만 하므로 안전)
  delete copy.template_code;
  delete copy.template_ver_code;

  if (!Array.isArray(copy.sections)) return copy;

  for (const sec of copy.sections) {
    if (!sec) continue;
    delete sec.section_code;

    if (!Array.isArray(sec.subsections)) continue;
    for (const sub of sec.subsections) {
      if (!sub) continue;
      delete sub.subsection_code;

      if (!Array.isArray(sub.items)) continue;
      for (const it of sub.items) {
        if (!it) continue;
        delete it.item_code;
      }
    }
  }
  return copy;
}

/* -------------------------------
  1) 조사지 버전 목록
--------------------------------*/
async function listTemplates() {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql.listTemplates);
    return safeJSON(rows);
  } finally {
    conn.release();
  }
}

/* -------------------------------
  2) 조사지 신규 등록
     - 메이저 버전 = (현재 최대 + 1.0)
     - 세부버전 시작 = 메이저와 동일 (예: 4.0 → 4.0)
--------------------------------*/
async function insertSurvey(data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ 들어오는 데이터에서 모든 *_code 제거 (원본 보호)
    data = stripIdsForVersioning(data);

    const rows = await conn.query(sql.getLatestVersionNo);
    const latest = rows && rows[0];
    const nextVersion = latest?.version_no
      ? (Number(latest.version_no) + 1).toFixed(1)
      : "1.0";

    const createdBy = data?.template?.created_by ?? 1;
    const createdAt = data?.template?.created_at ?? new Date();
    const status = data?.template?.status ?? "ACTIVE";

    //최신 메이저만 current로 유지하려면 여기서 기존 Y 내리기
    await conn.query(sql.deactivateAllCurrentVersions);

    const tmplRes = await conn.query(sql.insertTemplate, [
      nextVersion,
      status,
      createdBy,
      createdAt,
    ]);
    const template_code = tmplRes.insertId;

    const verRes = await conn.query(sql.insertTemplateVer, [
      template_code,
      nextVersion,
      createdAt,
      null,
      "Y",
      createdBy,
      createdAt,
    ]);
    const template_ver_code = verRes.insertId;

    // 섹션/서브섹션/아이템은 모두 새로 INSERT (ID 재사용 금지)
    for (const sec of data?.sections ?? []) {
      const secRes = await conn.query(sql.insertSection, [
        template_ver_code,
        sec.title ?? "",
        sec.desc ?? "",
      ]);
      const section_code = secRes.insertId;

      for (const sub of sec.subsections ?? []) {
        const subRes = await conn.query(sql.insertSubsection, [
          section_code,
          sub.title ?? "",
          sub.desc ?? "",
        ]);
        const subsection_code = subRes.insertId;

        for (const item of sub.items ?? []) {
          await conn.query(sql.insertItem, [
            subsection_code,
            item.question_type ?? "TEXT",
            item.question_text ?? "",
            item.is_required ?? "N",
            item.option_values ? JSON.stringify(item.option_values) : null,
          ]);
        }
      }
    }

    await conn.commit();
    return safeJSON({
      template_code,
      template_ver_code,
      version_no: nextVersion,
      version_detail_no: nextVersion,
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* -------------------------------
  3) 최신(활성) 조사지 조회 (트리)
--------------------------------*/
async function getLatestSurvey() {
  const conn = await pool.getConnection();
  try {
    const ver = await conn.query(sql.getLatestTemplateVer);
    if (!ver || ver.length === 0) return null;

    const header = ver[0];
    const sections = await conn.query(sql.getSectionsByVer, [
      header.template_ver_code,
    ]);
    const subsections = await conn.query(sql.getSubsectionsByVer, [
      header.template_ver_code,
    ]);
    const items = await conn.query(sql.getItemsByVer, [
      header.template_ver_code,
    ]);

    for (const it of items)
      it.option_values = normalizeOptions(it.option_values);

    const subBySection = new Map();
    for (const s of sections) subBySection.set(s.section_code, []);
    for (const sub of subsections) {
      if (!subBySection.has(sub.section_code))
        subBySection.set(sub.section_code, []);
      subBySection.get(sub.section_code).push({ ...sub, items: [] });
    }

    const itemBySub = new Map();
    for (const sub of subsections) itemBySub.set(sub.subsection_code, []);
    for (const it of items) {
      if (!itemBySub.has(it.subsection_code))
        itemBySub.set(it.subsection_code, []);
      itemBySub.get(it.subsection_code).push(it);
    }

    for (const subs of subBySection.values()) {
      for (const s of subs) s.items = itemBySub.get(s.subsection_code) || [];
    }

    const sectionsTree = sections.map((s) => ({
      ...s,
      subsections: subBySection.get(s.section_code) || [],
    }));

    return safeJSON({ ...header, sections: sectionsTree });
  } finally {
    conn.release();
  }
}

/* -------------------------------
  4) 답변 저장 (제출)
--------------------------------*/
async function insertAnswers(body) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const template_ver_code = body.template_ver_code;
    const written_by = body.written_by ?? 1;
    const now = new Date();

    const submission = await conn.query(sql.insertSubmission, [
      template_ver_code,
      now, // submit_at
      now, // updated_at
      written_by,
      "CA1",
      null, // app_at
    ]);
    const submit_code = submission.insertId;

    for (const [item_code, value] of Object.entries(body.answers || {})) {
      let answer_text = null;
      if (Array.isArray(value)) answer_text = JSON.stringify(value);
      else if (value !== undefined && value !== null)
        answer_text = String(value);

      await conn.query(sql.insertAnswer, [
        Number(item_code),
        submit_code,
        answer_text,
        now,
      ]);
    }

    await conn.commit();
    return safeJSON({ submit_code });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* -------------------------------
  6) 기존 조사지 수정 → 새 세부버전 생성
--------------------------------*/
async function updateSurveyVersion(templateCode, data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ 들어오는 데이터에서 모든 *_code 제거 (원본 보호)
    data = stripIdsForVersioning(data);

    // (정책에 따라) 같은 템플릿 내 기존 Y 내리기
    await conn.query(sql.deactivateAllCurrentVersions);

    const nextRows = await conn.query(sql.getNextDetailVersion, [templateCode]);
    const nextDetail =
      (nextRows && nextRows[0] && String(nextRows[0].next_detail)) || "1.0";

    const creator = data?.template?.created_by ?? 1;
    const createdAt = data?.template?.created_at ?? new Date();

    const verResult = await conn.query(sql.insertTemplateVer, [
      templateCode,
      nextDetail,
      new Date(),
      null,
      "Y", // (과거 메이저 수정 시엔 'N'으로 넣는 정책도 가능—팀 결정)
      creator,
      createdAt,
    ]);
    const template_ver_code = verResult.insertId;

    // 섹션/서브섹션/아이템은 모두 새로 INSERT (ID 재사용 금지)
    for (const sec of data.sections || []) {
      const secRes = await conn.query(sql.insertSection, [
        template_ver_code,
        sec.title ?? "",
        sec.desc ?? "",
      ]);
      const section_code = secRes.insertId;

      for (const sub of sec.subsections || []) {
        const subRes = await conn.query(sql.insertSubsection, [
          section_code,
          sub.title ?? "",
          sub.desc ?? "",
        ]);
        const subsection_code = subRes.insertId;

        for (const item of sub.items || []) {
          await conn.query(sql.insertItem, [
            subsection_code,
            item.question_type ?? "TEXT",
            item.question_text ?? "",
            item.is_required ?? "N",
            item.option_values ? JSON.stringify(item.option_values) : null,
          ]);
        }
      }
    }

    await conn.commit();
    return safeJSON({ template_ver_code, nextDetail });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* -------------------------------
  7) 역할별 제출본 목록
--------------------------------*/
async function listSubmissionsByRole(role, userId) {
  const conn = await pool.getConnection();
  try {
    let rows;
    if (role === 1) {
      rows = await conn.query(sql.listSubmissionsByWriter, [userId]);
    } else if (role === 2) {
      rows = await conn.query(sql.listSubmissionsByAssignee, [userId]);
    } else {
      rows = await conn.query(sql.listAllSubmissions);
    }
    return safeJSON(rows);
  } finally {
    conn.release();
  }
}

/* -------------------------------
  8) 제출본 상세 조회 (트리 + 답변)
--------------------------------*/
async function getSubmissionDetail(submitCode) {
  const conn = await pool.getConnection();
  try {
    const headerRows = await conn.query(sql.getSubmissionHeaderBySubmit, [
      submitCode,
    ]);
    if (!headerRows || headerRows.length === 0) return null;
    const header = headerRows[0];

    const sections = await conn.query(sql.getSectionsByVer, [
      header.template_ver_code,
    ]);
    const subsections = await conn.query(sql.getSubsectionsByVer, [
      header.template_ver_code,
    ]);
    const items = await conn.query(sql.getItemsByVer, [
      header.template_ver_code,
    ]);

    const answers = await conn.query(sql.getAnswersBySubmit, [submitCode]);
    const answerMap = new Map();
    for (const a of answers) {
      let v = a.answer_text;
      if (typeof v === "string") {
        const s = v.trim();
        if (
          (s.startsWith("[") && s.endsWith("]")) ||
          (s.startsWith("{") && s.endsWith("}"))
        ) {
          try {
            v = JSON.parse(s);
          } catch {
            /* 그대로 문자열 */
          }
        }
      }
      answerMap.set(a.item_code, v);
    }

    for (const it of items) {
      it.option_values = normalizeOptions(it.option_values);
      it.answer_text = answerMap.has(it.item_code)
        ? answerMap.get(it.item_code)
        : null;
    }

    const subBySection = new Map();
    for (const s of sections) subBySection.set(s.section_code, []);
    for (const sub of subsections) {
      if (!subBySection.has(sub.section_code))
        subBySection.set(sub.section_code, []);
      subBySection.get(sub.section_code).push({ ...sub, items: [] });
    }

    const itemBySub = new Map();
    for (const sub of subsections) itemBySub.set(sub.subsection_code, []);
    for (const it of items) {
      if (!itemBySub.has(it.subsection_code))
        itemBySub.set(it.subsection_code, []);
      itemBySub.get(it.subsection_code).push(it);
    }

    for (const subs of subBySection.values()) {
      for (const s of subs) s.items = itemBySub.get(s.subsection_code) || [];
    }

    const sectionsTree = sections.map((s) => ({
      ...s,
      subsections: subBySection.get(s.section_code) || [],
    }));

    return safeJSON({ ...header, sections: sectionsTree });
  } finally {
    conn.release();
  }
}

/* -------------------------------
  9) 제출본 수정 (답변 재저장)
--------------------------------*/
async function updateSubmissionAnswers(submitCode, body) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(sql.deleteAnswersBySubmit, [submitCode]);

    const now = new Date();
    for (const [item_code, value] of Object.entries(body.answers || {})) {
      let answer_text = null;
      if (Array.isArray(value)) answer_text = JSON.stringify(value);
      else if (value !== undefined && value !== null)
        answer_text = String(value);

      await conn.query(sql.insertAnswer, [
        Number(item_code),
        submitCode,
        answer_text,
        now,
      ]);
    }

    await conn.query(sql.updateSubmissionUpdatedAt, [now, submitCode]);

    await conn.commit();
    return safeJSON({ submit_code: Number(submitCode) });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// 수정으로 원본 안바뀌게 하려구
async function getSurveyDetailByVer(templateVerCode) {
  const conn = await pool.getConnection();
  try {
    const ver = await conn.query(sql.getTemplateVerByVerCode, [
      templateVerCode,
    ]);
    if (!ver || ver.length === 0) return null;

    const header = ver[0];

    const sections = await conn.query(sql.getSectionsByVer, [
      header.template_ver_code,
    ]);
    const subsections = await conn.query(sql.getSubsectionsByVer, [
      header.template_ver_code,
    ]);
    const items = await conn.query(sql.getItemsByVer, [
      header.template_ver_code,
    ]);

    for (const it of items)
      it.option_values = normalizeOptions(it.option_values);

    const subBySection = new Map();
    for (const s of sections) subBySection.set(s.section_code, []);
    for (const sub of subsections) {
      if (!subBySection.has(sub.section_code))
        subBySection.set(sub.section_code, []);
      subBySection.get(sub.section_code).push({ ...sub, items: [] });
    }

    const itemBySub = new Map();
    for (const sub of subsections) itemBySub.set(sub.subsection_code, []);
    for (const it of items) {
      if (!itemBySub.has(it.subsection_code))
        itemBySub.set(it.subsection_code, []);
      itemBySub.get(it.subsection_code).push(it);
    }

    for (const subs of subBySection.values()) {
      for (const s of subs) s.items = itemBySub.get(s.subsection_code) || [];
    }

    const sectionsTree = sections.map((s) => ({
      ...s,
      subsections: subBySection.get(s.section_code) || [],
    }));

    return safeJSON({ ...header, sections: sectionsTree });
  } finally {
    conn.release();
  }
}

module.exports = {
  listTemplates,
  insertSurvey,
  getLatestSurvey,
  insertAnswers,
  // getSurveyDetail,
  updateSurveyVersion,
  listSubmissionsByRole,
  getSubmissionDetail,
  updateSubmissionAnswers,
  getSurveyDetailByVer,
};
