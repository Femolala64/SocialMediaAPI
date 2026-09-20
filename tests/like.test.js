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
const createPost = async (token, overrides = {}) => {
  const res = await request(app)
    .post("/api/v1/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Test Post",
      content: "Test content",
      ...overrides,
    });
  return res.body.data;
};

describe("POST /api/v1/likes/:id", () => {
  it("likes a post", async () => {
    const { token } = await createUserAndToken();
    const post = await createPost(token);
    await request(app)
      .patch(`/api/v1/posts/${post._id}/publish`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post(`/api/v1/likes/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);

    const getRes = await request(app)
      .get(`/api/v1/posts/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.body.data.like_count).toBe(1);
  });

  it("rejects a duplicate like", async () => {
    const { token } = await createUserAndToken();
    const post = await createPost(token);

    await request(app)
      .post(`/api/v1/likes/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post(`/api/v1/likes/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(409);
  });

  it("returns 404 for a post that does not exist", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .post("/api/v1/likes/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("rejects a request with no token", async () => {
    const { token } = await createUserAndToken();
    const post = await createPost(token);

    const res = await request(app).post(`/api/v1/likes/${post._id}`);

    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /api/v1/likes/:id", () => {
  it("unlikes a post", async () => {
    const { token } = await createUserAndToken();
    const post = await createPost(token);
    await request(app)
      .patch(`/api/v1/posts/${post._id}/publish`)
      .set("Authorization", `Bearer ${token}`);
    await request(app)
      .post(`/api/v1/likes/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/v1/likes/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const getRes = await request(app)
      .get(`/api/v1/posts/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.body.data.like_count).toBe(0);
  });

  it("returns 404 when the post was not liked", async () => {
    const { token } = await createUserAndToken();
    const post = await createPost(token);

    const res = await request(app)
      .delete(`/api/v1/likes/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("auth middleware", () => {
  it("rejects a malformed token", async () => {
    const res = await request(app)
      .get("/api/v1/posts/me")
      .set("Authorization", "Bearer notarealtoken");

    expect(res.statusCode).toBe(401);
  });

  it("rejects a header without Bearer", async () => {
    const res = await request(app)
      .get("/api/v1/posts/me")
      .set("Authorization", "sometoken");

    expect(res.statusCode).toBe(401);
  });
});
