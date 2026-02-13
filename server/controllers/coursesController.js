const pool = require("../config/db");

// CREATE COURSE
const createCourse = async (req, res) => {
  const { name, credits, goal_grade, semester_id } = req.body;
  const userId = req.user.userId;

  if (!name) {
    return res.status(400).json({ message: "Course name required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO courses (user_id, semester_id, name, credits, goal_grade)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, semester_id, name, credits, goal_grade]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
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

// UPDATE COURSE
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, credits, goal_grade } = req.body;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM courses WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const result = await pool.query(
      `UPDATE courses SET name=$1, credits=$2, goal_grade=$3
       WHERE id=$4 RETURNING *`,
      [name, credits, goal_grade, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE COURSE
const deleteCourse = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      `DELETE FROM courses WHERE id=$1 AND user_id=$2`,
      [id, userId]
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
  updateCourse,
  deleteCourse,
};
