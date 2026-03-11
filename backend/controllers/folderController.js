import sql from "../config/db.js";

export const getFolders = async (req, res) => {
  try {
    const rows = await sql`
      SELECT f.*,
        (SELECT COUNT(*) FROM questions q WHERE q.folder_id = f.id) AS question_count,
        (SELECT COUNT(*) FROM questions q WHERE q.user_id = f.user_id AND q.revisit = TRUE AND q.revisit_done = FALSE) AS revisit_count
      FROM folders f
      WHERE f.user_id = ${req.user.id}
      ORDER BY f.is_system DESC, f.name ASC
    `;

    const folders = rows.map((folder) => {
      const questionCount = Number(folder.question_count || 0);
      const revisitCount = Number(folder.revisit_count || 0);

      if (folder.name === "REVISIT") {
        return { ...folder, question_count: revisitCount };
      }

      return { ...folder, question_count: questionCount };
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

    const insertedFolders = await sql`
      INSERT INTO folders (user_id, name)
      VALUES (${req.user.id}, ${name.trim()})
      RETURNING id, name
    `;

    const folder = insertedFolders[0];

    return res.status(201).json({
      id: folder.id,
      name: folder.name
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const renameFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const rows = await sql`
      SELECT * FROM folders
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (!rows[0].can_rename) {
      return res.status(400).json({ message: "This folder cannot be renamed" });
    }

    await sql`
      UPDATE folders
      SET name = ${name}
      WHERE id = ${id}
    `;

    return res.json({ message: "Folder renamed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await sql`
      SELECT * FROM folders
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (!rows[0].can_delete) {
      return res.status(400).json({ message: "This folder cannot be deleted" });
    }

    await sql`
      DELETE FROM folders
      WHERE id = ${id}
    `;

    return res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};