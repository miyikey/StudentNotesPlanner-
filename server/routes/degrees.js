const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createDegree,
  getDegrees,
  getDegreeById,
  updateDegree,
  deleteDegree
} = require("../controllers/degreesController");

// Protect all routes with auth middleware
router.use(authMiddleware);

// Create a new degree
router.post("/", createDegree);

// Get all degrees for the logged-in user
router.get("/", getDegrees);

// Get a single degree by ID
router.get("/:id", getDegreeById);

// Update a degree by ID
router.put("/:id", updateDegree);

// Delete a degree by ID
router.delete("/:id", deleteDegree);

module.exports = router;
