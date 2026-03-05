const request = require("supertest");
const app = require("../app");

describe("Assignments API", () => {
  let token;
  let assignmentId;

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

  describe("POST /assignments - Create Assignment", () => {
    test("should create an assignment with valid data", async () => {
      const response = await request(app)
        .post("/assignments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Project 1",
          code: "PROJ1",
          due_date: "2026-03-20"
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Project 1");
      expect(response.body.code).toBe("PROJ1");
      expect(response.body.due_date).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.user_id).toBeDefined();

      assignmentId = response.body.id; // Save for later tests
    });

    test("should create an assignment without code", async () => {
      const response = await request(app)
        .post("/assignments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Homework 1",
          due_date: "2026-03-25"
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Homework 1");
      expect(response.body.due_date).toBeDefined();
      expect(response.body.id).toBeDefined();
    });

    test("should return 400 when name is missing", async () => {
      const response = await request(app)
        .post("/assignments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          due_date: "2026-03-30"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Name and due date are required");
    });

    test("should return 400 when due_date is missing", async () => {
      const response = await request(app)
        .post("/assignments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Assignment"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Name and due date are required");
    });

    test("should return 400 when both name and due_date are missing", async () => {
      const response = await request(app)
        .post("/assignments")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Name and due date are required");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .post("/assignments")
        .send({
          name: "Test Assignment",
          due_date: "2026-04-01"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /assignments - Get All Assignments", () => {
    test("should get all assignments for authenticated user", async () => {
      const response = await request(app)
        .get("/assignments")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].name).toBeDefined();
      expect(response.body[0].due_date).toBeDefined();
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/assignments");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("PUT /assignments/:id - Update Assignment", () => {
    test("should update an assignment with valid data", async () => {
      const response = await request(app)
        .put(`/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Project 1 Updated",
          code: "PROJ1-UPDATED",
          due_date: "2026-03-25"
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Project 1 Updated");
      expect(response.body.code).toBe("PROJ1-UPDATED");
      expect(response.body.due_date).toBeDefined();
    });

    test("should return 404 for non-existent assignment", async () => {
      const response = await request(app)
        .put("/assignments/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test",
          due_date: "2026-04-01"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Assignment not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .put(`/assignments/${assignmentId}`)
        .send({
          name: "Updated Name",
          due_date: "2026-04-05"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("DELETE /assignments/:id - Delete Assignment", () => {
    test("should delete an assignment successfully", async () => {
      // First create an assignment to delete
      const createRes = await request(app)
        .post("/assignments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Assignment to Delete",
          due_date: "2026-04-10"
        });

      const assignmentIdToDelete = createRes.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/assignments/${assignmentIdToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assignment deleted successfully");
    });

    test("should return 404 for non-existent assignment", async () => {
      const response = await request(app)
        .delete("/assignments/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Assignment not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .delete(`/assignments/${assignmentId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});
