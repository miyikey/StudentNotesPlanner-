const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote
} = require("../controllers/notesController");

// All routes are protected
router.use(authMiddleware);

router.post("/", createNote);     // Create a note
router.get("/", getNotes);        // Get all notes
router.put("/:id", updateNote);   // Update note by ID
router.delete("/:id", deleteNote); // Delete note by ID

module.exports = router;
