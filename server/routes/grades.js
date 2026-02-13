const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade,
  calculateGrades,
} = require("../controllers/gradesController");

// Protect all routes with auth middleware
router.use(authMiddleware);

// Create a new grade
router.post("/", createGrade);

// Get all grades for the logged-in user
router.get("/", getGrades);

// Calculate weighted average for the user
router.get("/calculate", calculateGrades);

// Update a grade by ID
router.put("/:id", updateGrade);

// Delete a grade by ID
router.delete("/:id", deleteGrade);

module.exports = router;
