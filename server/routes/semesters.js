const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSemester,
  getSemestersByDegree,
  getSemesterById,
  updateSemester,
  deleteSemester
} = require("../controllers/semestersController");

// Protect all routes with auth middleware
router.use(authMiddleware);

// Create a new semester
router.post("/", createSemester);

// Get all semesters for a degree
router.get("/degree/:degreeId", getSemestersByDegree);

// Get a single semester by ID
router.get("/:id", getSemesterById);

// Update a semester by ID
router.put("/:id", updateSemester);

// Delete a semester by ID
router.delete("/:id", deleteSemester);

module.exports = router;
