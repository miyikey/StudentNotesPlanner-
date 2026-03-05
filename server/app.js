const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const gradesRoutes = require("./routes/grades");
const assignmentsRoutes = require("./routes/assignments");
const coursesRoutes = require("./routes/courses");
const assessmentsRoutes = require("./routes/assessments");
const degreesRoutes = require("./routes/degrees");
const semestersRoutes = require("./routes/semesters");
const summaryRoutes = require("./routes/summary");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/grades", gradesRoutes);
app.use("/assignments", assignmentsRoutes);
app.use("/courses", coursesRoutes);
app.use("/assessments", assessmentsRoutes);
app.use("/degrees", degreesRoutes);
app.use("/semesters", semestersRoutes);
app.use("/summary", summaryRoutes);

module.exports = app;