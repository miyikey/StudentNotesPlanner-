const request = require("supertest");
const app = require("../app");

describe("Assessments API", () => {
  let token;
  let courseCode;
  let assessmentId;

  // Setup: Register, login, and create a course to get token and courseCode
  beforeAll(async () => {
    const uniqueEmail = `testuser${Date.now()}@example.com`;

    // Register user
    const registerRes = await request(app)
      .post("/auth/register")
      .send({
        email: uniqueEmail,
        password: "TestPassword123"
      });

    // Login to get token
    const loginRes = await request(app)
      .post("/auth/login")
      .send({
        email: uniqueEmail,
        password: "TestPassword123"
      });

    token = loginRes.body.token;

    // Create a course to associate assessments with
    courseCode = `CS${Date.now()}`;
    await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: courseCode,
        name: "Data Structures",
        credits: 4,
        goal_grade: 3.5
      });
  });

  describe("POST /assessments - Create Assessment", () => {
    test("should create an assessment with valid data", async () => {
      const response = await request(app)
        .post("/assessments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          course_code: courseCode,
          name: "Midterm Exam",
          weight: 30,
          score_actual: 85,
          score_out_of: 100,
          due_date: "2026-03-15",
          is_completed: true
        });

      expect(response.status).toBe(201);
      expect(response.body.course_code).toBe(courseCode);
      expect(response.body.name).toBe("Midterm Exam");
      expect(response.body.weight).toBe("30");
      expect(response.body.score_actual).toBe("85");
      expect(response.body.score_out_of).toBe("100");
      expect(response.body.id).toBeDefined();

      assessmentId = response.body.id; // Save for later tests
    });

    test("should create assessment without score data", async () => {
      const response = await request(app)
        .post("/assessments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          course_code: courseCode,
          name: "Final Exam",
          weight: 40,
          due_date: "2026-05-10"
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Final Exam");
      expect(response.body.id).toBeDefined();
    });

    test("should return 400 when course_code is missing", async () => {
      const response = await request(app)
        .post("/assessments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Quiz",
          weight: 10
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("course_code and name required");
    });

    test("should return 400 when name is missing", async () => {
      const response = await request(app)
        .post("/assessments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          course_code: courseCode,
          weight: 20
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("course_code and name required");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .post("/assessments")
        .send({
          course_code: courseCode,
          name: "Test Assessment",
          weight: 15
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /assessments/:courseCode - Get Assessments by Course", () => {
    test("should get all assessments for a course", async () => {
      const response = await request(app)
        .get(`/assessments/${courseCode}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].name).toBeDefined();
      expect(response.body[0].course_code).toBe(courseCode);
    });

    test("should return empty array for course with no assessments", async () => {
      const nonexistentCourseCode = `NONEXIST${Date.now()}`;
      const response = await request(app)
        .get(`/assessments/${nonexistentCourseCode}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get(`/assessments/${courseCode}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("PUT /assessments/:id - Update Assessment", () => {
    test("should update an assessment with valid data", async () => {
      const response = await request(app)
        .put(`/assessments/${assessmentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Midterm Exam Updated",
          weight: 35,
          score_actual: 92,
          score_out_of: 100,
          due_date: "2026-03-20",
          is_completed: true
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Midterm Exam Updated");
      expect(response.body.weight).toBe("35");
      expect(response.body.score_actual).toBe("92");
    });

    test("should return 404 for non-existent assessment", async () => {
      const response = await request(app)
        .put("/assessments/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test",
          weight: 20
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Assessment not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .put(`/assessments/${assessmentId}`)
        .send({
          name: "Updated Name",
          weight: 25
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("DELETE /assessments/:id - Delete Assessment", () => {
    test("should delete an assessment successfully", async () => {
      // First create an assessment to delete
      const createRes = await request(app)
        .post("/assessments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          course_code: courseCode,
          name: "Assessment to Delete",
          weight: 5
        });

      const assessmentIdToDelete = createRes.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/assessments/${assessmentIdToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assessment deleted");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .delete(`/assessments/${assessmentId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});
