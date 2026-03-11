import pool from "../config/db.js";
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
    return res.status(500).json({ message: "Failed to fetch metadata", error: error.message });
  }
};

export const analyzeQuestionCode = async (req, res) => {
  try {
    const { code, title } = req.body;
    const analysis = await analyzeCode(code, title);
    return res.json(analysis);
  } catch (error) {
    return res.status(500).json({ message: "Failed to analyze code", error: error.message });
  }
};

export const getQuestionsByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    const [folderRows] = await pool.query(
      "SELECT * FROM folders WHERE id = ? AND user_id = ?",
      [folderId, req.user.id]
    );

    if (folderRows.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const folder = folderRows[0];
    let query = "";
    let params = [];

    if (folder.name === "REVISIT") {
      query = `
        SELECT q.*, f.name AS folder_name
        FROM questions q
        JOIN folders f ON q.folder_id = f.id
        WHERE q.user_id = ? AND q.revisit = TRUE AND q.revisit_done = FALSE
        ORDER BY q.revisit_date ASC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT q.*, f.name AS folder_name
        FROM questions q
        JOIN folders f ON q.folder_id = f.id
        WHERE q.user_id = ? AND q.folder_id = ?
        ORDER BY q.created_at DESC
      `;
      params = [req.user.id, folderId];
    }

    const [questions] = await pool.query(query, params);
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

    const [result] = await pool.query(
      `INSERT INTO questions (
        user_id, folder_id, title, link, platform, difficulty, description, code,
        my_tc, my_sc, expected_tc, expected_sc,
        revisit, revisit_date, revisit_done
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [
        req.user.id,
        folder_id,
        finalTitle,
        link,
        finalPlatform,
        finalDifficulty,
        description || "",
        code || "",
        finalMyTc,
        finalMySc,
        finalExpectedTc,
        finalExpectedSc,
        !!revisit,
        revisitDate
      ]
    );

    return res.status(201).json({
      message: "Question created successfully",
      id: result.insertId
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

    const [existingRows] = await pool.query(
      "SELECT * FROM questions WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    const existing = existingRows[0];
    const finalLink = link || existing.link;
    const meta = await fetchQuestionMeta(finalLink);
    const analysis = await analyzeCode(code ?? existing.code, title || meta.title);

    let revisitDate = null;
    if (revisit && revisit_days) {
      revisitDate = new Date();
      revisitDate.setDate(revisitDate.getDate() + Number(revisit_days));
    } else if (revisit && existing.revisit_date) {
      revisitDate = existing.revisit_date;
    }

    await pool.query(
      `UPDATE questions SET
        folder_id = ?,
        title = ?,
        link = ?,
        platform = ?,
        difficulty = ?,
        description = ?,
        code = ?,
        my_tc = ?,
        my_sc = ?,
        expected_tc = ?,
        expected_sc = ?,
        revisit = ?,
        revisit_date = ?,
        revisit_done = ?
       WHERE id = ? AND user_id = ?`,
      [
        folder_id || existing.folder_id,
        title || meta.title,
        finalLink,
        platform || meta.platform || existing.platform,
        difficulty || meta.difficulty || existing.difficulty,
        description ?? existing.description,
        code ?? existing.code,
        my_tc || analysis.my_tc,
        my_sc || analysis.my_sc,
        expected_tc || analysis.expected_tc,
        expected_sc || analysis.expected_sc,
        !!revisit,
        revisitDate,
        !!revisit_done,
        id,
        req.user.id
      ]
    );

    return res.json({ message: "Question updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM questions WHERE id = ? AND user_id = ?", [
      id,
      req.user.id
    ]);

    return res.json({ message: "Question deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};