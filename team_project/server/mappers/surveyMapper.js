const pool = require("../configs/db");
const sql = require("../sql/surveySql");

/* -------------------------------
  1️⃣ 조사지 목록
--------------------------------*/
async function listTemplates() {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(sql.listTemplates);
    return rows;
  } finally {
    conn.release();
  }
}

/* -------------------------------
  2️⃣ 조사지 등록
--------------------------------*/
async function insertSurvey(data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const templateResult = await conn.query(sql.insertTemplate, [
      data.template.version_no,
      data.template.status,
      data.template.created_by,
      data.template.created_at,
    ]);
    const template_code = templateResult.insertId;

    const verResult = await conn.query(sql.insertTemplateVer, [
      template_code,
      1,
      data.template.created_at,
      null,
      "Y",
      data.template.created_by,
      data.template.created_at,
    ]);
    const template_ver_code = verResult.insertId;

    for (const sec of data.sections || []) {
      const secRes = await conn.query(sql.insertSection, [template_ver_code, sec.title, sec.desc]);
      const section_code = secRes.insertId;

      for (const sub of sec.subsections || []) {
        const subRes = await conn.query(sql.insertSubsection, [section_code, sub.title, sub.desc]);
        const subsection_code = subRes.insertId;

        for (const item of sub.items || []) {
          await conn.query(sql.insertItem, [
            subsection_code,
            item.question_type,
            item.question_text,
            item.is_required,
            item.option_values ? JSON.stringify(item.option_values) : null,
          ]);
        }
      }
    }

    await conn.commit();
    return { template_code, template_ver_code };
  } catch (err) {
    console.error("[insertSurvey ERROR]", err);
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* -------------------------------
  3️⃣ 최신 조사지 조회 (이미 완성된 부분)
--------------------------------*/
async function getLatestSurvey() {
  const conn = await pool.getConnection();
  try {
    const ver = await conn.query(sql.getLatestTemplateVer);
    if (!ver || ver.length === 0) return null;

    const header = ver[0];
    const sections = await conn.query(sql.getSectionsByVer, [header.template_ver_code]);
    const subsections = await conn.query(sql.getSubsectionsByVer, [header.template_ver_code]);
    const items = await conn.query(sql.getItemsByVer, [header.template_ver_code]);

    // ✅ 안전 파서
    function normalizeOptions(val) {
      if (val == null) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "object") {
        if (Buffer.isBuffer(val)) {
          try {
            return JSON.parse(val.toString("utf8"));
          } catch {
            return [];
          }
        }
        return val;
      }
      if (typeof val === "string") {
        const s = val.trim();
        if (!s) return [];
        try {
          return JSON.parse(s);
        } catch {
          return [];
        }
      }
      return [];
    }

    for (const it of items) {
      it.option_values = normalizeOptions(it.option_values);
    }

    const subBySection = new Map();
    for (const s of sections) subBySection.set(s.section_code, []);
    for (const sub of subsections) {
      if (!subBySection.has(sub.section_code)) subBySection.set(sub.section_code, []);
      subBySection.get(sub.section_code).push({ ...sub, items: [] });
    }

    const itemBySub = new Map();
    for (const sub of subsections) itemBySub.set(sub.subsection_code, []);
    for (const it of items) {
      if (!itemBySub.has(it.subsection_code)) itemBySub.set(it.subsection_code, []);
      itemBySub.get(it.subsection_code).push(it);
    }

    for (const subs of subBySection.values()) {
      for (const s of subs) s.items = itemBySub.get(s.subsection_code) || [];
    }

    const sectionsTree = sections.map((s) => ({
      ...s,
      subsections: subBySection.get(s.section_code) || [],
    }));

    const safe = JSON.parse(
      JSON.stringify(
        { ...header, sections: sectionsTree },
        (_, v) => (typeof v === "bigint" ? Number(v) : v)
      )
    );

    return safe;
  } finally {
    conn.release();
  }
}

/* -------------------------------
  4️⃣ 답변 저장
--------------------------------*/
async function insertAnswers(body) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const template_ver_code = body.template_ver_code;
    const written_by = body.written_by || 1;

    const submission = await conn.query(sql.insertSubmission, [
      template_ver_code,
      new Date(),
      new Date(),
      written_by,
      "SUBMITTED",
      new Date(),
    ]);
    const submit_code = submission.insertId;

    for (const [item_code, value] of Object.entries(body.answers || {})) {
      let answer_text = null;
      if (Array.isArray(value)) {
        answer_text = JSON.stringify(value);
      } else if (value !== undefined && value !== null) {
        answer_text = String(value);
      }
      await conn.query(sql.insertAnswer, [
        Number(item_code),
        submit_code,
        answer_text,
        new Date(),
      ]);
    }

    await conn.commit();

    const safe = JSON.parse(JSON.stringify({ submit_code }, (_, v) => (typeof v === "bigint" ? Number(v) : v)));
    return safe;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* -------------------------------
  ✅ exports (4개 함수)
--------------------------------*/
module.exports = {
  listTemplates,
  insertSurvey,
  getLatestSurvey,
  insertAnswers,
};
