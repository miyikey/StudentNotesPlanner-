const request = require("supertest");
const app = require("../app");

describe("Authentication - POST /auth/register", () => {
  test("should register a new user successfully", async () => {
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: uniqueEmail,
        password: "TestPassword123"
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(uniqueEmail);
    expect(response.body.user.id).toBeDefined();
  });

  test("should return 400 when email is missing", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        password: "TestPassword123"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password required");
  });

  test("should return 400 when password is missing", async () => {
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: uniqueEmail
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password required");
  });

  test("should return 400 when both email and password are missing", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password required");
  });
});