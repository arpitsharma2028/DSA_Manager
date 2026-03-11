import sql from "../config/db.js";
import { fetchQuestionMeta } from "../utils/fetchQuestionMeta.js";
import { analyzeCode } from "../utils/analyzeCode.js";

export const fetchMetaFromLink = async (req, res) => {
  try {
    const { link } = req.body;

    if (!link) {
      return res.status(400).json({ message: "Link is required" });
    }

    const meta = await fetchQuestionMeta(link);
    return res.json(meta);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch metadata", error: error.message });
  }
};

export const analyzeQuestionCode = async (req, res) => {
  try {
    const { code, title } = req.body;
    const analysis = await analyzeCode(code, title);
    return res.json(analysis);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to analyze code", error: error.message });
  }
};

export const getQuestionsByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const folderRows = await sql`
      SELECT * FROM folders
      WHERE id = ${folderId} AND user_id = ${req.user.id}
    `;

    if (folderRows.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const folder = folderRows[0];
    let questions = [];

    if (folder.name === "REVISIT") {
      questions = await sql`
        SELECT q.*, f.name AS folder_name
        FROM questions q
        JOIN folders f ON q.folder_id = f.id
        WHERE q.user_id = ${req.user.id}
          AND q.revisit = TRUE
          AND q.revisit_done = FALSE
        ORDER BY q.revisit_date ASC
      `;
    } else {
      questions = await sql`
        SELECT q.*, f.name AS folder_name
        FROM questions q
        JOIN folders f ON q.folder_id = f.id
        WHERE q.user_id = ${req.user.id}
          AND q.folder_id = ${folderId}
        ORDER BY q.created_at DESC
      `;
    }

    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const {
      folder_id,
      link,
      title,
      difficulty,
      platform,
      description,
      code,
      revisit,
      revisit_days,
      my_tc,
      my_sc,
      expected_tc,
      expected_sc
    } = req.body;

    if (!folder_id || !link) {
      return res.status(400).json({ message: "Folder and link are required" });
    }

    const meta = await fetchQuestionMeta(link);
    const analysis = await analyzeCode(code, title || meta.title);

    let revisitDate = null;
    if (revisit && revisit_days) {
      revisitDate = new Date();
      revisitDate.setDate(revisitDate.getDate() + Number(revisit_days));
    }

    const finalTitle = title || meta.title;
    const finalDifficulty = difficulty || meta.difficulty || "Easy";
    const finalPlatform = platform || meta.platform || "Other";

    const finalMyTc = my_tc || analysis.my_tc;
    const finalMySc = my_sc || analysis.my_sc;
    const finalExpectedTc = expected_tc || analysis.expected_tc;
    const finalExpectedSc = expected_sc || analysis.expected_sc;

    const insertedQuestions = await sql`
      INSERT INTO questions (
        user_id,
        folder_id,
        title,
        link,
        platform,
        difficulty,
        description,
        code,
        my_tc,
        my_sc,
        expected_tc,
        expected_sc,
        revisit,
        revisit_date,
        revisit_done
      )
      VALUES (
        ${req.user.id},
        ${folder_id},
        ${finalTitle},
        ${link},
        ${finalPlatform},
        ${finalDifficulty},
        ${description || ""},
        ${code || ""},
        ${finalMyTc},
        ${finalMySc},
        ${finalExpectedTc},
        ${finalExpectedSc},
        ${!!revisit},
        ${revisitDate},
        FALSE
      )
      RETURNING id
    `;

    return res.status(201).json({
      message: "Question created successfully",
      id: insertedQuestions[0].id
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      folder_id,
      link,
      title,
      difficulty,
      platform,
      description,
      code,
      revisit,
      revisit_days,
      revisit_done,
      my_tc,
      my_sc,
      expected_tc,
      expected_sc
    } = req.body;

    const existingRows = await sql`
      SELECT * FROM questions
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    const existing = existingRows[0];
    const finalLink = link || existing.link;
    const finalCode = code ?? existing.code;
    const finalTitleForAnalysis = title || existing.title;

    const meta = await fetchQuestionMeta(finalLink);
    const analysis = await analyzeCode(finalCode, finalTitleForAnalysis || meta.title);

    let revisitDate = null;
    if (revisit && revisit_days) {
      revisitDate = new Date();
      revisitDate.setDate(revisitDate.getDate() + Number(revisit_days));
    } else if (revisit && existing.revisit_date) {
      revisitDate = existing.revisit_date;
    }

    await sql`
      UPDATE questions
      SET
        folder_id = ${folder_id || existing.folder_id},
        title = ${title || meta.title},
        link = ${finalLink},
        platform = ${platform || meta.platform || existing.platform},
        difficulty = ${difficulty || meta.difficulty || existing.difficulty},
        description = ${description ?? existing.description},
        code = ${finalCode},
        my_tc = ${my_tc || analysis.my_tc},
        my_sc = ${my_sc || analysis.my_sc},
        expected_tc = ${expected_tc || analysis.expected_tc},
        expected_sc = ${expected_sc || analysis.expected_sc},
        revisit = ${!!revisit},
        revisit_date = ${revisitDate},
        revisit_done = ${!!revisit_done}
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;

    return res.json({ message: "Question updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    await sql`
      DELETE FROM questions
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;

    return res.json({ message: "Question deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};