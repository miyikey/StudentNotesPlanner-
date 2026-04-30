const request = require("supertest");
const app = require("../app");

describe("Degrees API", () => {
  let token;
  let degreeId;

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

  describe("POST /degrees - Create Degree", () => {
    test("should create a degree with valid data", async () => {
      const response = await request(app)
        .post("/degrees")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Bachelor of Computer Science",
          total_credits_required: 120,
          goal_wam: 3.5
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Bachelor of Computer Science");
      expect(response.body.total_credits_required).toBe(120);
      expect(response.body.goal_wam).toBe("3.5");
      expect(response.body.id).toBeDefined();

      degreeId = response.body.id; // Save for later tests
    });

    test("should create a degree without goal_wam", async () => {
      const response = await request(app)
        .post("/degrees")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Bachelor of Science",
          total_credits_required: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Bachelor of Science");
      expect(response.body.total_credits_required).toBe(100);
      expect(response.body.id).toBeDefined();
    });

    test("should return 400 when name is missing", async () => {
      const response = await request(app)
        .post("/degrees")
        .set("Authorization", `Bearer ${token}`)
        .send({
          total_credits_required: 120
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Name and total credits required");
    });

    test("should return 400 when total_credits_required is missing", async () => {
      const response = await request(app)
        .post("/degrees")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Some Degree"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Name and total credits required");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .post("/degrees")
        .send({
          name: "Test Degree",
          total_credits_required: 128
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /degrees - Get All Degrees", () => {
    test("should get all degrees for authenticated user", async () => {
      const response = await request(app)
        .get("/degrees")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].name).toBeDefined();
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/degrees");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /degrees/:id - Get Single Degree", () => {
    test("should get a single degree by ID", async () => {
      const response = await request(app)
        .get(`/degrees/${degreeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(degreeId);
      expect(response.body.name).toBe("Bachelor of Computer Science");
    });

    test("should return 404 for non-existent degree", async () => {
      const response = await request(app)
        .get("/degrees/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Degree not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get(`/degrees/${degreeId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("PUT /degrees/:id - Update Degree", () => {
    test("should update a degree with valid data", async () => {
      const response = await request(app)
        .put(`/degrees/${degreeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Bachelor of Computer Science - Updated",
          total_credits_required: 125,
          goal_wam: 3.7
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Bachelor of Computer Science - Updated");
      expect(response.body.total_credits_required).toBe(125);
      expect(response.body.goal_wam).toBe("3.7");
    });

    test("should return 404 for non-existent degree", async () => {
      const response = await request(app)
        .put("/degrees/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test",
          total_credits_required: 120
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Degree not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .put(`/degrees/${degreeId}`)
        .send({
          name: "Updated Name",
          total_credits_required: 120
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("DELETE /degrees/:id - Delete Degree", () => {
    test("should delete a degree successfully", async () => {
      // First create a degree to delete
      const createRes = await request(app)
        .post("/degrees")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Degree to Delete",
          total_credits_required: 100
        });

      const degreeIdToDelete = createRes.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/degrees/${degreeIdToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Degree deleted successfully");
    });

    test("should return 404 for non-existent degree", async () => {
      const response = await request(app)
        .delete("/degrees/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Degree not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .delete(`/degrees/${degreeId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});
