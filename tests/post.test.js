const request = require("supertest");
const app = require("../app");

const createUserAndToken = async (overrides = {}) => {
  const res = await request(app)
    .post("/api/v1/auth/signup")
    .send({
      first_name: "Test",
      last_name: "User",
      username: "testUser",
      email: "test@example.com",
      password: "12345678",
      ...overrides,
    });
  return {
    token: res.body.token,
    user: res.body.data,
  };
};

describe("POST /api/v1/posts", () => {
  it("creates a post in draft state", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Chike goes to school",
        content: "i must amount to something in this life",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.state).toBe("draft");
  });

  it("rejects a request with no token", async () => {
    const res = await request(app).post("/api/v1/posts").send({
      title: "Chike goes to school",
      content: "i must amount to something in this life",
    });

    expect(res.statusCode).toBe(401);
  });

  it("rejects a post with no title", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "i must amount to something in this life",
      });

    expect(res.statusCode).toBe(400);
  });
});
