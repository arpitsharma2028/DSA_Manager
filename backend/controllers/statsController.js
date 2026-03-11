import sql from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await sql`
      SELECT COUNT(*) AS count
      FROM questions
      WHERE user_id = ${userId}
    `;

    const easy = await sql`
      SELECT COUNT(*) AS count
      FROM questions
      WHERE user_id = ${userId} AND difficulty = 'Easy'
    `;

    const medium = await sql`
      SELECT COUNT(*) AS count
      FROM questions
      WHERE user_id = ${userId} AND difficulty = 'Medium'
    `;

    const hard = await sql`
      SELECT COUNT(*) AS count
      FROM questions
      WHERE user_id = ${userId} AND difficulty = 'Hard'
    `;

    const revisit = await sql`
      SELECT COUNT(*) AS count
      FROM questions
      WHERE user_id = ${userId}
        AND revisit = TRUE
        AND revisit_done = FALSE
    `;

    return res.json({
      total: Number(total[0].count),
      easy: Number(easy[0].count),
      medium: Number(medium[0].count),
      hard: Number(hard[0].count),
      revisit: Number(revisit[0].count)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};