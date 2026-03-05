const request = require("supertest");
const app = require("../app");

describe("Notes API", () => {
  let token;
  let noteId;

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

  describe("POST /notes - Create Note", () => {
    test("should create a note with valid data", async () => {
      const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Study Guide",
          body: "Chapter 1: Introduction to algorithms"
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Study Guide");
      expect(response.body.body).toBe("Chapter 1: Introduction to algorithms");
      expect(response.body.id).toBeDefined();
      expect(response.body.user_id).toBeDefined();

      noteId = response.body.id; // Save for later tests
    });

    test("should return 400 when title is missing", async () => {
      const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          body: "Note without title"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title and body required");
    });

    test("should return 400 when body is missing", async () => {
      const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Title without body"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title and body required");
    });

    test("should return 400 when both title and body are missing", async () => {
      const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title and body required");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .post("/notes")
        .send({
          title: "Test Note",
          body: "This should fail"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("GET /notes - Get All Notes", () => {
    test("should get all notes for authenticated user", async () => {
      const response = await request(app)
        .get("/notes")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].title).toBeDefined();
      expect(response.body[0].body).toBeDefined();
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .get("/notes");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("PUT /notes/:id - Update Note", () => {
    test("should update a note with valid data", async () => {
      const response = await request(app)
        .put(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Study Guide Updated",
          body: "Chapter 1-2: Introduction to algorithms and data structures"
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Study Guide Updated");
      expect(response.body.body).toBe("Chapter 1-2: Introduction to algorithms and data structures");
    });

    test("should return 404 for non-existent note", async () => {
      const response = await request(app)
        .put("/notes/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test",
          body: "Test body"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Note not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .put(`/notes/${noteId}`)
        .send({
          title: "Test",
          body: "Test body"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });

  describe("DELETE /notes/:id - Delete Note", () => {
    test("should delete a note successfully", async () => {
      // First create a note to delete
      const createRes = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Note to Delete",
          body: "This note will be deleted"
        });

      const noteIdToDelete = createRes.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/notes/${noteIdToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Note deleted successfully");
    });

    test("should return 404 for non-existent note", async () => {
      const response = await request(app)
        .delete("/notes/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Note not found");
    });

    test("should return 401 when no token is provided", async () => {
      const response = await request(app)
        .delete(`/notes/${noteId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("No token provided");
    });
  });
});
