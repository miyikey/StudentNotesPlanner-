const pool = require("../config/db"); // your db connection

// Create a new grade
const createGrade = async (req, res) => {
  const { name, score, weight } = req.body;
  const userId = req.user.userId; // comes from authMiddleware

  if (!name || score == null || weight == null) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO grades (user_id, name, score, weight)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, score, weight]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all grades for the logged-in user
const getGrades = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM grades WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a grade
const updateGrade = async (req, res) => {
  const { id } = req.params;
  const { name, score, weight } = req.body;
  const userId = req.user.userId;

  try {
    // Check ownership
    const check = await pool.query(
      `SELECT * FROM grades WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Grade not found" });
    }

    const result = await pool.query(
      `UPDATE grades
       SET name = $1, score = $2, weight = $3
       WHERE id = $4
       RETURNING *`,
      [name, score, weight, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a grade
const deleteGrade = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Check ownership
    const check = await pool.query(
      `SELECT * FROM grades WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Grade not found" });
    }

    await pool.query(`DELETE FROM grades WHERE id = $1`, [id]);

    res.json({ message: "Grade deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Calculate weighted average for the logged-in user
const calculateGrades = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT score, weight FROM grades WHERE user_id = $1`,
      [userId]
    );

    const grades = result.rows;
    if (!grades || grades.length === 0) {
      return res.json({ average: null, totalWeight: 0, message: "No grades found" });
    }

    let weightedSum = 0;
    let totalWeight = 0;

    grades.forEach((g) => {
      const score = parseFloat(g.score) || 0;
      const weight = parseFloat(g.weight) || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    });

    const average = totalWeight > 0 ? weightedSum / totalWeight : null;

    res.json({ average, totalWeight, weightedSum });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createGrade, getGrades, updateGrade, deleteGrade, calculateGrades };
