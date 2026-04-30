const pool = require("../config/db");

// CREATE COURSE
const createCourse = async (req, res) => {
  const { code, name, credits, goal_grade, semester_id } = req.body;
  const userId = req.user.userId;

  if (!code || !name) {
    return res.status(400).json({ message: "Course code and name required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO courses (user_id, semester_id, code, name, credits, goal_grade)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, semester_id, code, name, credits, goal_grade]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log("CREATE COURSE ERROR:", err);
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET ALL COURSES
const getCourses = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM courses WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE COURSE BY CODE
const getCourseByCode = async (req, res) => {
  const { code } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM courses WHERE code=$1 AND user_id=$2`,
      [code, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE COURSE
const updateCourse = async (req, res) => {
  const { code } = req.params;
  const { name, credits, goal_grade } = req.body;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM courses WHERE code=$1 AND user_id=$2`,
      [code, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const result = await pool.query(
      `UPDATE courses SET name=$1, credits=$2, goal_grade=$3
       WHERE code=$4 RETURNING *`,
      [name, credits, goal_grade, code]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE COURSE
const deleteCourse = async (req, res) => {
  const { code } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      `DELETE FROM courses WHERE code=$1 AND user_id=$2`,
      [code, userId]
    );

    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseByCode,
  updateCourse,
  deleteCourse,
};
