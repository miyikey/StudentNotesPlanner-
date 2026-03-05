const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getCreditsSummary,
  getWamSummary
} = require("../controllers/summaryController");

// Protect all routes with auth middleware
router.use(authMiddleware);

// Get credits summary for a degree
router.get("/credits/:degreeId", getCreditsSummary);

// Get WAM summary for a degree
router.get("/wam/:degreeId", getWamSummary);

module.exports = router;
