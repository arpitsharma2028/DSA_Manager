import pool from "../config/db.js";

export const getFolders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*,
        (SELECT COUNT(*) FROM questions q WHERE q.folder_id = f.id) AS question_count,
        (SELECT COUNT(*) FROM questions q WHERE q.user_id = f.user_id AND q.revisit = TRUE AND q.revisit_done = FALSE) AS revisit_count
       FROM folders f
       WHERE f.user_id = ?
       ORDER BY f.is_system DESC, f.name ASC`,
      [req.user.id]
    );

    const folders = rows.map((folder) => {
      if (folder.name === "REVISIT") {
        return { ...folder, question_count: folder.revisit_count };
      }
      return folder;
    });

    return res.json(folders);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO folders (user_id, name) VALUES (?, ?)",
      [req.user.id, name.trim()]
    );

    return res.status(201).json({
      id: result.insertId,
      name: name.trim()
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const renameFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM folders WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (!rows[0].can_rename) {
      return res.status(400).json({ message: "This folder cannot be renamed" });
    }

    await pool.query("UPDATE folders SET name = ? WHERE id = ?", [name, id]);

    return res.json({ message: "Folder renamed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM folders WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (!rows[0].can_delete) {
      return res.status(400).json({ message: "This folder cannot be deleted" });
    }

    await pool.query("DELETE FROM folders WHERE id = ?", [id]);

    return res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};