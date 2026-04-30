const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const gradesRoutes = require("./routes/grades"); // <-- add this
const assignmentsRoutes = require("./routes/assignments");
const coursesRoutes = require("./routes/courses");
const assessmentsRoutes = require("./routes/assessments");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/grades", gradesRoutes); // <-- make sure this line exists
app.use("/assignments", assignmentsRoutes);
app.use("/courses", coursesRoutes);
app.use("/assessments", assessmentsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
