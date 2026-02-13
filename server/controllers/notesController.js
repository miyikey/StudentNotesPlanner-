const pool = require("../config/db");

// Create a new note
async function createNote(req, res) {
  const { title, body } = req.body;
  const userId = req.user.userId; // from authMiddleware

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO notes (user_id, title, body) VALUES ($1, $2, $3) RETURNING *",
      [userId, title, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Get all notes for the logged-in user
async function getNotes(req, res) {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Update a note
async function updateNote(req, res) {
  const { id } = req.params;
  const { title, body } = req.body;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "UPDATE notes SET title=$1, body=$2 WHERE id=$3 AND user_id=$4 RETURNING *",
      [title, body, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete a note
async function deleteNote(req, res) {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "DELETE FROM notes WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createNote, getNotes, updateNote, deleteNote };
