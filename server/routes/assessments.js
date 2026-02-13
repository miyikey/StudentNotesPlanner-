const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createAssessment,
  getAssessments,
  updateAssessment,
  deleteAssessment,
} = require("../controllers/assessmentsController");

router.use(authMiddleware);

router.post("/", createAssessment);
router.get("/:courseId", getAssessments);
router.put("/:id", updateAssessment);
router.delete("/:id", deleteAssessment);

module.exports = router;
