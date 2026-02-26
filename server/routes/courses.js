const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createCourse,
  getCourses,
  getCourseByCode,
  updateCourse,
  deleteCourse,
} = require("../controllers/coursesController");

router.use(authMiddleware);

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:code", getCourseByCode);
router.put("/:code", updateCourse);
router.delete("/:code", deleteCourse);

module.exports = router;
