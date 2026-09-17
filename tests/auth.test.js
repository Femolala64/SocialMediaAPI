const request = require("supertest");
const app = require("../app");

describe("POST /api/v1/auth/signup", () => {
  it("creates a user and returns a token", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      first_name: "oluwafemi",
      last_name: "John-Fabunmi",
      username: "Ndababy",
      email: "oluwafemigabiel33@gmail.com",
      password: "12345678",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.password).toBeUndefined();
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/v1/auth/signup").send({
      first_name: "oluwafemi",
      last_name: "John-Fabunmi",
      username: "Ndababy",
      email: "oluwafemigabiel33@gmail.com",
      password: "12345678",
    });
    const res = await request(app).post("/api/v1/auth/signup").send({
      first_name: "oluwafemi",
      last_name: "John-Fabunmi",
      username: "Ndababy2", // different username is fine
      email: "oluwafemigabiel33@gmail.com", // same email
      password: "12345678",
    });
    expect(res.statusCode).toBe(409);
  });

  it("rejects a missing field", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      first_name: "oluwafemi",
      last_name: "John-Fabunmi",
      username: "Ndababy",
      email: "oluwafemigabiel33@gmail.com",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/v1/auth/signin", () => {
  it("signs in with correct credentials", async () => {
    await request(app).post("/api/v1/auth/signup").send({
      first_name: "oluwafemi",
      last_name: "John-Fabunmi",
      username: "Ndababy",
      email: "oluwafemigabiel33@gmail.com",
      password: "12345678",
    });

    const res = await request(app).post("/api/v1/auth/signin").send({
      email: "oluwafemigabiel33@gmail.com",
      password: "12345678",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects a wrong password", async () => {
    await request(app).post("/api/v1/auth/signup").send({
      first_name: "oluwafemi",
      last_name: "John-Fabunmi",
      username: "Ndababy",
      email: "oluwafemigabiel33@gmail.com",
      password: "12345678",
    });

    const res = await request(app).post("/api/v1/auth/signin").send({
      email: "oluwafemigabiel33@gmail.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
  });
});
