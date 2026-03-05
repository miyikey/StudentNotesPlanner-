const pool = require("../config/db");

// Create a new degree
const createDegree = async (req, res) => {
  const { name, total_credits_required, goal_wam } = req.body;
  const userId = req.user.userId;

  if (!name || total_credits_required == null) {
    return res.status(400).json({ message: "Name and total credits required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO degrees (user_id, name, total_credits_required, goal_wam)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, total_credits_required, goal_wam || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all degrees for the logged-in user
const getDegrees = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM degrees WHERE user_id = $1 ORDER BY id DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single degree by ID
const getDegreeById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM degrees WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Degree not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a degree
const updateDegree = async (req, res) => {
  const { id } = req.params;
  const { name, total_credits_required, goal_wam } = req.body;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM degrees WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Degree not found" });
    }

    const result = await pool.query(
      `UPDATE degrees
       SET name = $1, total_credits_required = $2, goal_wam = $3
       WHERE id = $4
       RETURNING *`,
      [name, total_credits_required, goal_wam, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a degree
const deleteDegree = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM degrees WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Degree not found" });
    }

    await pool.query(`DELETE FROM degrees WHERE id = $1`, [id]);

    res.json({ message: "Degree deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createDegree,
  getDegrees,
  getDegreeById,
  updateDegree,
  deleteDegree
};
