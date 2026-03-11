import pool from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[total]] = await pool.query(
      "SELECT COUNT(*) AS count FROM questions WHERE user_id = ?",
      [userId]
    );
    const [[easy]] = await pool.query(
      "SELECT COUNT(*) AS count FROM questions WHERE user_id = ? AND difficulty = 'Easy'",
      [userId]
    );
    const [[medium]] = await pool.query(
      "SELECT COUNT(*) AS count FROM questions WHERE user_id = ? AND difficulty = 'Medium'",
      [userId]
    );
    const [[hard]] = await pool.query(
      "SELECT COUNT(*) AS count FROM questions WHERE user_id = ? AND difficulty = 'Hard'",
      [userId]
    );
    const [[revisit]] = await pool.query(
      "SELECT COUNT(*) AS count FROM questions WHERE user_id = ? AND revisit = TRUE AND revisit_done = FALSE",
      [userId]
    );

    return res.json({
      total: total.count,
      easy: easy.count,
      medium: medium.count,
      hard: hard.count,
      revisit: revisit.count
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};