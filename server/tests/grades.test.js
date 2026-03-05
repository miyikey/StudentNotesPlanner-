const request = require("supertest");
const app = require("../app");

describe("Grades API", () => {
  let token;
  let gradeId;

  // Setup: Register and login to get token
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
  });

  describe("POST /grades - Create Grade", () => {
    test("should create a grade with valid data", async () => {
      const response = await request(app)
        .post("/grades")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Midterm Exam",
          score: 85,
          weight: 30
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Midterm Exam");
      expect(response.body.score).toBe("85");
      expect(response.body.weight).toBe("30");
      expect(response.body.id).toBeDefined();
      
      gradeId = response.body.id; // Save for later tests
    });

    test("should return 400 when name is missing", async () => {
      const response = await request(app)
        .post("/grades")
        .set("Authorization", `Bearer ${token}`)
        .send({
          score: 90,
          weight: 25
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Please provide all fields");
    });

    test("should return 400 when score is missing", async () => {
      const response = await request(app)
        .post("/grades")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Final Exam",
          weight: 40
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Please provide all fields");
    });

    test("should return 400 when weight is missing", async () => {
      const response = await request(app)
        .post("/grades")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Quiz",
          score: 95
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Please provide all fields");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .post("/grades")
        .send({
          name: "Test Grade",
          score: 88,
          weight: 20
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /grades - Get All Grades", () => {
    test("should get all grades for authenticated user", async () => {
      const response = await request(app)
        .get("/grades")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].name).toBeDefined();
      expect(response.body[0].score).toBeDefined();
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/grades");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("PUT /grades/:id - Update Grade", () => {
    test("should update a grade with valid data", async () => {
      const response = await request(app)
        .put(`/grades/${gradeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Midterm Exam Updated",
          score: 92,
          weight: 35
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Midterm Exam Updated");
      expect(response.body.score).toBe("92");
      expect(response.body.weight).toBe("35");
    });

    test("should return 404 for non-existent grade", async () => {
      const response = await request(app)
        .put("/grades/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test",
          score: 80,
          weight: 20
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Grade not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .put(`/grades/${gradeId}`)
        .send({
          name: "Test",
          score: 85,
          weight: 25
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("DELETE /grades/:id - Delete Grade", () => {
    test("should delete a grade successfully", async () => {
      // First create a grade to delete
      const createRes = await request(app)
        .post("/grades")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Grade to Delete",
          score: 75,
          weight: 15
        });

      const gradeIdToDelete = createRes.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/grades/${gradeIdToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Grade deleted successfully");
    });

    test("should return 404 for non-existent grade", async () => {
      const response = await request(app)
        .delete("/grades/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Grade not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .delete(`/grades/${gradeId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /grades/calculate - Calculate Weighted Average", () => {
    test("should calculate weighted average for user", async () => {
      const response = await request(app)
        .get("/grades/calculate")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.average).toBeDefined();
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/grades/calculate");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});
