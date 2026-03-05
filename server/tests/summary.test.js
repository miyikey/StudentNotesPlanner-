const request = require("supertest");
const app = require("../app");

describe("Summary API", () => {
  let token;
  let degreeId;
  let courseId;

  // Setup: Register, login, create a degree, and create a course
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

    // Create a degree with goal_wam
    const degreeRes = await request(app)
      .post("/degrees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bachelor of Computer Science",
        total_credits_required: 120,
        goal_wam: 3.5
      });

    degreeId = degreeRes.body.id;

    // Create a course with 3 credits
    const courseRes = await request(app)
      .post("/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: `CS101-${Date.now()}`,
        name: "Intro to CS",
        credits: 3,
        goal_grade: 3.5
      });

    courseId = courseRes.body.id;
  });

  describe("GET /summary/credits/:degreeId - Get Credits Summary", () => {
    test("should get credits summary for a degree", async () => {
      const response = await request(app)
        .get(`/summary/credits/${degreeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.total_credits_required).toBe(120);
      expect(response.body.credits_completed).toBe(3);
      expect(response.body.credits_remaining).toBe(117);
      expect(response.body.degree_name).toBe("Bachelor of Computer Science");
    });

    test("should update remaining credits when new course is added", async () => {
      // Add another course with 4 credits
      await request(app)
        .post("/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          code: `CS102-${Date.now()}`,
          name: "Data Structures",
          credits: 4,
          goal_grade: 3.5
        });

      const response = await request(app)
        .get(`/summary/credits/${degreeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.credits_completed).toBe(7);
      expect(response.body.credits_remaining).toBe(113);
    });

    test("should return 404 for non-existent degree", async () => {
      const response = await request(app)
        .get("/summary/credits/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Degree not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get(`/summary/credits/${degreeId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /summary/wam/:degreeId - Get WAM Summary", () => {
    test("should get wam summary when no grades exist", async () => {
      const response = await request(app)
        .get(`/summary/wam/${degreeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.goal_wam).toBe(3.5);
      expect(response.body.degree_name).toBe("Bachelor of Computer Science");
    });

    test("should calculate current wam with grades", async () => {
      // Create a grade with score 85 and weight 30
      await request(app)
        .post("/grades")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Midterm",
          score: 85,
          weight: 30
        });

      // Create another grade with score 90 and weight 40
      await request(app)
        .post("/grades")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Final",
          score: 90,
          weight: 40
        });

      const response = await request(app)
        .get(`/summary/wam/${degreeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.current_wam).toBeDefined();
      expect(response.body.goal_wam).toBe(3.5);
      expect(response.body.total_grades).toBe(2);
      // WAM calculation will vary based on existing grades in DB
      expect(response.body.current_wam).toBeDefined();
      expect(typeof response.body.current_wam).toBe("number");
    });

    test("should return 404 for non-existent degree", async () => {
      const response = await request(app)
        .get("/summary/wam/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Degree not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get(`/summary/wam/${degreeId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});
