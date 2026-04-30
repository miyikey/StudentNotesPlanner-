const pool = require("../config/db");

// Get credits summary for a degree
const getCreditsSummary = async (req, res) => {
  const { degreeId } = req.params;
  const userId = req.user.userId;

  try {
    // Get the degree
    const degreeResult = await pool.query(
      `SELECT * FROM degrees WHERE id = $1 AND user_id = $2`,
      [degreeId, userId]
    );

    if (degreeResult.rows.length === 0) {
      return res.status(404).json({ message: "Degree not found" });
    }

    const degree = degreeResult.rows[0];
    const totalCreditsRequired = parseInt(degree.total_credits_required) || 0;

    // Get all courses for this degree and sum their credits
    const coursesResult = await pool.query(
      `SELECT SUM(CAST(credits AS INTEGER)) as total_completed
       FROM courses 
       WHERE user_id = $1`,
      [userId]
    );

    const totalCreditsCompleted = parseInt(coursesResult.rows[0].total_completed) || 0;
    const creditsRemaining = totalCreditsRequired - totalCreditsCompleted;

    res.json({
      total_credits_required: totalCreditsRequired,
      credits_completed: totalCreditsCompleted,
      credits_remaining: creditsRemaining,
      degree_name: degree.name
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get WAM summary for a degree
const getWamSummary = async (req, res) => {
  const { degreeId } = req.params;
  const userId = req.user.userId;

  try {
    // Get the degree
    const degreeResult = await pool.query(
      `SELECT * FROM degrees WHERE id = $1 AND user_id = $2`,
      [degreeId, userId]
    );

    if (degreeResult.rows.length === 0) {
      return res.status(404).json({ message: "Degree not found" });
    }

    const degree = degreeResult.rows[0];
    const goalWam = degree.goal_wam ? parseFloat(degree.goal_wam) : null;

    // Get all grades for the user
    const gradesResult = await pool.query(
      `SELECT score, weight FROM grades WHERE user_id = $1`,
      [userId]
    );

    const grades = gradesResult.rows;

    if (!grades || grades.length === 0) {
      return res.json({
        current_wam: null,
        goal_wam: goalWam,
        total_grades: 0,
        degree_name: degree.name,
        message: "No grades found"
      });
    }

    let weightedSum = 0;
    let totalWeight = 0;

    grades.forEach((g) => {
      const score = parseFloat(g.score) || 0;
      const weight = parseFloat(g.weight) || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    });

    const currentWam = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : null;

    res.json({
      current_wam: currentWam ? parseFloat(currentWam) : null,
      goal_wam: goalWam,
      total_grades: grades.length,
      degree_name: degree.name
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCreditsSummary,
  getWamSummary
};
