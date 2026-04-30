const pool = require("../config/db");

// Create a new semester
const createSemester = async (req, res) => {
  const { degree_id, year, semester_number } = req.body;
  const userId = req.user.userId;

  if (!degree_id || year == null || semester_number == null) {
    return res.status(400).json({ message: "degree_id, year, and semester_number are required" });
  }

  try {
    // Check if degree belongs to user
    const degreeCheck = await pool.query(
      `SELECT * FROM degrees WHERE id = $1 AND user_id = $2`,
      [degree_id, userId]
    );

    if (degreeCheck.rows.length === 0) {
      return res.status(404).json({ message: "Degree not found" });
    }

    const result = await pool.query(
      `INSERT INTO semesters (degree_id, user_id, year, semester_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [degree_id, userId, year, semester_number]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all semesters for a degree
const getSemestersByDegree = async (req, res) => {
  const { degreeId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM semesters WHERE degree_id = $1 AND user_id = $2 ORDER BY year ASC, semester_number ASC`,
      [degreeId, userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single semester by ID
const getSemesterById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM semesters WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Semester not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a semester
const updateSemester = async (req, res) => {
  const { id } = req.params;
  const { year, semester_number } = req.body;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM semesters WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Semester not found" });
    }

    const result = await pool.query(
      `UPDATE semesters
       SET year = $1, semester_number = $2
       WHERE id = $3
       RETURNING *`,
      [year, semester_number, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a semester
const deleteSemester = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM semesters WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Semester not found" });
    }

    await pool.query(`DELETE FROM semesters WHERE id = $1`, [id]);

    res.json({ message: "Semester deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSemester,
  getSemestersByDegree,
  getSemesterById,
  updateSemester,
  deleteSemester
};
