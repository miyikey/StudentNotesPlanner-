const request = require("supertest");
const app = require("../app");

describe("Courses API", () => {
  let token;
  let courseCode;

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
    courseCode = `CS${Date.now()}`;
  });

  describe("POST /courses - Create Course", () => {
    test("should create a course with valid data", async () => {
      const response = await request(app)
        .post("/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          code: courseCode,
          name: "Introduction to Computer Science",
          credits: 3,
          goal_grade: 4.0
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(courseCode);
      expect(response.body.name).toBe("Introduction to Computer Science");
      expect(response.body.credits).toBe(3);
      expect(response.body.goal_grade).toBe("4");
      expect(response.body.id).toBeDefined();
    });

    test("should return 400 when course code is missing", async () => {
      const response = await request(app)
        .post("/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Introduction to Computer Science",
          credits: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Course code and name required");
    });

    test("should return 400 when course name is missing", async () => {
      const response = await request(app)
        .post("/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          code: `CS${Date.now() + 1}`,
          credits: 3
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Course code and name required");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .post("/courses")
        .send({
          code: `CS${Date.now() + 2}`,
          name: "Test Course",
          credits: 3
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /courses - Get All Courses", () => {
    test("should get all courses for authenticated user", async () => {
      const response = await request(app)
        .get("/courses")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verify the course we created is in the list
      const createdCourse = response.body.find(c => c.code === courseCode);
      expect(createdCourse).toBeDefined();
      expect(createdCourse.name).toBe("Introduction to Computer Science");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/courses");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /courses/:code - Get Single Course", () => {
    test("should get a course by code", async () => {
      const response = await request(app)
        .get(`/courses/${courseCode}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(courseCode);
      expect(response.body.name).toBe("Introduction to Computer Science");
      expect(response.body.credits).toBe(3);
    });

    test("should return 404 when course code does not exist", async () => {
      const response = await request(app)
        .get("/courses/NONEXISTENT123")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Course not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get(`/courses/${courseCode}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("PUT /courses/:code - Update Course", () => {
    test("should update a course with valid data", async () => {
      const response = await request(app)
        .put(`/courses/${courseCode}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Advanced Computer Science",
          credits: 4,
          goal_grade: 3.8
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(courseCode);
      expect(response.body.name).toBe("Advanced Computer Science");
      expect(response.body.credits).toBe(4);
      expect(response.body.goal_grade).toBe("3.8");
    });

    test("should return 404 when course code does not exist", async () => {
      const response = await request(app)
        .put("/courses/NONEXISTENT123")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Course",
          credits: 3
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Course not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .put(`/courses/${courseCode}`)
        .send({
          name: "Updated Course",
          credits: 3
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("DELETE /courses/:code - Delete Course", () => {
    test("should delete a course", async () => {
      // Create a course to delete
      const createRes = await request(app)
        .post("/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          code: `DELETE${Date.now()}`,
          name: "Course to Delete",
          credits: 3
        });

      const codeToDelete = createRes.body.code;

      // Delete the course
      const deleteRes = await request(app)
        .delete(`/courses/${codeToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe("Course deleted");

      // Verify it's deleted
      const getRes = await request(app)
        .get(`/courses/${codeToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .delete(`/courses/${courseCode}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});
