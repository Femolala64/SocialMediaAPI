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

describe("POST /api/v1/follows/:id", () => {
  it("follows another user", async () => {
    const { token: tokenA } = await createUserAndToken({
      username: "pioneer user",
    });
    const { token: tokenB, user: userB } = await createUserAndToken({
      email: "userb@test.com",
      username: "userb",
    });
    const res = await request(app)
      .post(`/api/v1/follows/${userB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(201);
  });

  it("rejects following yourself", async () => {
    const { token, user } = await createUserAndToken();

    const res = await request(app)
      .post(`/api/v1/follows/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  it("rejects a duplicate follow", async () => {
    const { token: tokenA } = await createUserAndToken();
    const { user: userB } = await createUserAndToken({
      email: "userb@test.com",
      username: "userb",
    });
    await request(app)
      .post(`/api/v1/follows/${userB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const res = await request(app)
      .post(`/api/v1/follows/${userB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(409);
  });

  it("returns 404 for a user that does not exist", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .post("/api/v1/follows/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("rejects a request with no token", async () => {
    const { user } = await createUserAndToken();

    const res = await request(app).post(`/api/v1/follows/${user._id}`);

    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /api/v1/follows/:id", () => {
  it("unfollows a user", async () => {
    const { token: tokenA } = await createUserAndToken();
    const { user: userB } = await createUserAndToken({
      email: "userb@test.com",
      username: "userb",
    });

    await request(app)
      .post(`/api/v1/follows/${userB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const res = await request(app)
      .delete(`/api/v1/follows/${userB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
  });

  it("returns 404 when not following", async () => {
    const { token: tokenA } = await createUserAndToken();
    const { user: userB } = await createUserAndToken({
      email: "userb2@test.com",
      username: "userb2",
    });

    const res = await request(app)
      .delete(`/api/v1/follows/${userB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("GET /api/v1/follows/following", () => {
  it("returns users the requester follows", async () => {
    const { token: tokenA } = await createUserAndToken();
    const { user: userB } = await createUserAndToken({
      email: "userb3@test.com",
      username: "userb3",
    });

    await request(app)
      .post(`/api/v1/follows/${userB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const res = await request(app)
      .get("/api/v1/follows/following")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.following).toHaveLength(1);
    expect(res.body.following[0].following.username).toBeDefined();
  });
});

describe("GET /api/v1/follows/followers", () => {
  it("returns users following the requester", async () => {
    const { token: tokenA } = await createUserAndToken();
    const { token: tokenB, user: userB } = await createUserAndToken({
      email: "userb4@test.com",
      username: "userb4",
    });

    await request(app)
      .post(`/api/v1/follows/${userB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    const res = await request(app)
      .get("/api/v1/follows/followers")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.followers).toHaveLength(1);
  });
});
