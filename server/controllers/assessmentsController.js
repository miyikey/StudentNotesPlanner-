const pool = require("../config/db");

// CREATE assessment
const createAssessment = async (req, res) => {
  const {
    course_id,
    name,
    weight,
    score_actual,
    score_out_of,
    due_date,
    is_completed,
  } = req.body;

  const userId = req.user.userId;

  if (!course_id || !name) {
    return res.status(400).json({ message: "course_id and name required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO assessments 
      (user_id, course_id, name, weight, score_actual, score_out_of, due_date, is_completed)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        userId,
        course_id,
        name,
        weight,
        score_actual,
        score_out_of,
        due_date,
        is_completed || false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET assessments for course
const getAssessments = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM assessments
       WHERE course_id=$1 AND user_id=$2
       ORDER BY due_date ASC`,
      [courseId, userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE assessment
const updateAssessment = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    weight,
    score_actual,
    score_out_of,
    due_date,
    is_completed,
  } = req.body;

  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM assessments WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const result = await pool.query(
      `UPDATE assessments
       SET name=$1, weight=$2, score_actual=$3, score_out_of=$4,
           due_date=$5, is_completed=$6
       WHERE id=$7
       RETURNING *`,
      [name, weight, score_actual, score_out_of, due_date, is_completed, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE assessment
const deleteAssessment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      `DELETE FROM assessments WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );

    res.json({ message: "Assessment deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAssessment,
  getAssessments,
  updateAssessment,
  deleteAssessment,
};