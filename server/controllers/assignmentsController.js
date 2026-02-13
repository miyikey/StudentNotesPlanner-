const pool = require("../config/db");

// Create assignment
const createAssignment = async (req, res) => {
  const { name, code, due_date } = req.body;
  const userId = req.user.userId;

  if (!name || !due_date) {
    return res.status(400).json({ message: "Name and due date are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO assignments (user_id, name, code, due_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, code, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all assignments for logged-in user
const getAssignments = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT * FROM assignments WHERE user_id = $1 ORDER BY due_date ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  const { id } = req.params;
  const { name, code, due_date } = req.body;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM assignments WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const result = await pool.query(
      `UPDATE assignments SET name=$1, code=$2, due_date=$3 WHERE id=$4 RETURNING *`,
      [name, code, due_date, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const check = await pool.query(
      `SELECT * FROM assignments WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await pool.query(`DELETE FROM assignments WHERE id=$1`, [id]);
    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
};
