const request = require("supertest");
const app = require("../app");

describe("Semesters API", () => {
  let token;
  let degreeId;
  let semesterId;

  // Setup: Register, login, and create a degree
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

    // Create a degree
    const degreeRes = await request(app)
      .post("/degrees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bachelor of Computer Science",
        total_credits_required: 120
      });

    degreeId = degreeRes.body.id;
  });

  describe("POST /semesters - Create Semester", () => {
    test("should create a semester with valid data", async () => {
      const response = await request(app)
        .post("/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          degree_id: degreeId,
          year: 2024,
          semester_number: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.degree_id).toBe(degreeId);
      expect(response.body.year).toBe(2024);
      expect(response.body.semester_number).toBe(1);
      expect(response.body.id).toBeDefined();

      semesterId = response.body.id; // Save for later tests
    });

    test("should return 400 when degree_id is missing", async () => {
      const response = await request(app)
        .post("/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          year: 2024,
          semester_number: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("degree_id, year, and semester_number are required");
    });

    test("should return 400 when year is missing", async () => {
      const response = await request(app)
        .post("/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          degree_id: degreeId,
          semester_number: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("degree_id, year, and semester_number are required");
    });

    test("should return 400 when semester_number is missing", async () => {
      const response = await request(app)
        .post("/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          degree_id: degreeId,
          year: 2024
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("degree_id, year, and semester_number are required");
    });

    test("should return 404 when degree does not exist", async () => {
      const response = await request(app)
        .post("/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          degree_id: 99999,
          year: 2024,
          semester_number: 1
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Degree not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .post("/semesters")
        .send({
          degree_id: degreeId,
          year: 2024,
          semester_number: 1
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /semesters/degree/:degreeId - Get Semesters by Degree", () => {
    test("should get all semesters for a degree", async () => {
      const response = await request(app)
        .get(`/semesters/degree/${degreeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].degree_id).toBe(degreeId);
    });

    test("should return empty array for degree with no semesters", async () => {
      // Create another degree
      const newDegreeRes = await request(app)
        .post("/degrees")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Master's Degree",
          total_credits_required: 60
        });

      const response = await request(app)
        .get(`/semesters/degree/${newDegreeRes.body.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get(`/semesters/degree/${degreeId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /semesters/:id - Get Single Semester", () => {
    test("should get a single semester by ID", async () => {
      const response = await request(app)
        .get(`/semesters/${semesterId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(semesterId);
      expect(response.body.year).toBe(2024);
    });

    test("should return 404 for non-existent semester", async () => {
      const response = await request(app)
        .get("/semesters/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Semester not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get(`/semesters/${semesterId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("PUT /semesters/:id - Update Semester", () => {
    test("should update a semester with valid data", async () => {
      const response = await request(app)
        .put(`/semesters/${semesterId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          year: 2025,
          semester_number: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.year).toBe(2025);
      expect(response.body.semester_number).toBe(2);
    });

    test("should return 404 for non-existent semester", async () => {
      const response = await request(app)
        .put("/semesters/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          year: 2024,
          semester_number: 1
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Semester not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .put(`/semesters/${semesterId}`)
        .send({
          year: 2024,
          semester_number: 1
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("DELETE /semesters/:id - Delete Semester", () => {
    test("should delete a semester successfully", async () => {
      // First create a semester to delete
      const createRes = await request(app)
        .post("/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          degree_id: degreeId,
          year: 2024,
          semester_number: 3
        });

      const semesterIdToDelete = createRes.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/semesters/${semesterIdToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Semester deleted successfully");
    });

    test("should return 404 for non-existent semester", async () => {
      const response = await request(app)
        .delete("/semesters/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Semester not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .delete(`/semesters/${semesterId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});
