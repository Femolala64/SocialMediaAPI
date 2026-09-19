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

describe("PATCH /api/v1/posts/:id/publish", () => {
  it("publishes a post the user owns", async () => {
    const { token } = await createUserAndToken();
    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "thin Line",
        content: "Between sanity and insanity ",
      });

    const postId = res.body.data._id;

    const res2 = await request(app)
      .patch(`/api/v1/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.data.state).toBe("published");
  });

  it("rejects a user who does not own the post", async () => {
    const { token: tokenA } = await createUserAndToken();
    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Owned by A",
        content: "Content",
      });

    const postId = res.body.data._id;
    const { token: tokenB } = await createUserAndToken({
      email: "userb@example.com",
      username: "userB",
    });
    const res2 = await request(app)
      .patch(`/api/v1/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res2.statusCode).toBe(403);
  });

  it("rejects publishing twice", async () => {
    const { token } = await createUserAndToken();

    const createRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Already published",
        content: "Content",
      });

    const postId = createRes.body.data._id;

    await request(app)
      .patch(`/api/v1/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/v1/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for a post that does not exist", async () => {
    const { token } = await createUserAndToken();

    const fakeId = "507f1f77bcf86cd799439011";

    const res = await request(app)
      .patch(`/api/v1/posts/${fakeId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("PATCH /api/v1/posts/:id", () => {
  it("updates a post the user owns", async () => {
    const { token } = await createUserAndToken();
    const createdRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "O ti doJu e",
        content: "He don beske for here o ",
      });

    const postId = createdRes.body.data._id;
    const res = await request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "updated title",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe("updated title");
    expect(res.body.data.content).toBe("He don beske for here o ");
  });

  it("rejects a request with no token", async () => {
    const { token } = await createUserAndToken();
    const createdRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "SeyiVibes new album",
        content: "E don dey enter",
      });

    const postId = createdRes.body.data._id;
    const res = await request(app).patch(`/api/v1/posts/${postId}`).send({
      title: "E no enter Keh",
      content: "ABi o whine",
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 404 for a post that does not exist", async () => {
    const postId = "507f1f77bcf86cd799439011";
    const { token } = await createUserAndToken();
    const res = await request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "PoP caan",
        content: "Musty musician",
      });

    expect(res.statusCode).toBe(404);
  });

  it("rejects a user who does not own the post", async () => {
    const { token: tokenA } = await createUserAndToken();
    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Day By day ",
        content: "it would all work out",
      });
    const postId = res.body.data._id;
    const { token: tokenB } = await createUserAndToken({
      email: "KaloKalo@gmail.com",
      username: "userB",
    });
    const res2 = await request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        title: "two by two ",
        content: "It would if god allows",
      });
    expect(res2.statusCode).toBe(403);
  });

  it("returns 400 for a malformed id", async () => {
    //  token, PATCH /api/v1/posts/banana -> expect 400
    const { token } = await createUserAndToken();
    const postId = "banana";

    const res = await request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Swaguu",
        content: "SV too bad",
      });

    expect(res.statusCode).toBe(400);
  });

  it("ignores fields the client should not control", async () => {
    const { token } = await createUserAndToken();

    const createdRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Album sweet die",
        content: "Argue with your keyboard",
      });
    const postId = createdRes.body.data._id;
    const res = await request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "New title",
        state: "published",
        like_count: 999,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe("New title");
    expect(res.body.data.state).toBe("draft");
    expect(res.body.data.like_count).toBe(0);
  });
});

describe("DELETE /api/v1/posts/:id", () => {
  it("deletes a post the user owns", async () => {
    const { token } = await createUserAndToken();
    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Run",
        content: "Hustle yen crazy gan",
      });
    const postId = res.body.data._id;
    const deleteRes = await request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(200);
    const res2 = await request(app).get(`/api/v1/posts/${postId}`);
    expect(res2.statusCode).toBe(404);
  });

  it("rejects a request with no token", async () => {
    const { token } = await createUserAndToken();

    const res = request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Swaguu dripping",
        content: "E don kpekenLeh mess",
      });
    const postId = (await res).body.data._id;
    const deleteRes = await request(app).delete(`/api/v1/posts/${postId}`);
    expect(deleteRes.statusCode).toBe(401);
  });

  it("returns 404 for a post that does not exist", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .delete("/app/v1/posts/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("rejects a user who does not own the post", async () => {
    const { token: tokenA } = await createUserAndToken();

    const post = await createPost(tokenA);

    const { token: tokenB } = await createUserAndToken({
      email: "dzerbi@gmail.com",
      username: "dzerbi",
    });

    const res = await request(app)
      .delete(`/api/v1/posts/${post._id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.statusCode).toBe(403);
  });

  it("returns 400 for a malformed id", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .delete("/api/v1/posts/banana")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/v1/posts/me", () => {
  it("returns the user's own posts", async () => {
    const { token } = await createUserAndToken();

    await createPost(token);
    await createPost(token, { title: "Second Post" });

    const res = await request(app)
      .get("/api/v1/posts/me")
      .set("Authorization", `Bearer ${token}`);

    console.log(res.statusCode, res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(2);
    expect(res.body.totalPost).toBe(2);
  });

  it("rejects a request with no token", async () => {
    const res = await request(app).get("/api/v1/posts/me");
    expect(res.statusCode).toBe(401);
  });

  it("returns only the requesting user's posts", async () => {
    //  user A creates one post
    const { token: tokenA } = await createUserAndToken();
    await createPost(tokenA);

    //  user B — await, override email and username — creates one post
    const { token: tokenB } = await createUserAndToken({
      email: "kalokalo2@gmail.com",
      username: "Jitsu",
    });

    await createPost(tokenB, { title: "test content for tokenB" });
    //  GET /api/v1/posts/me as A
    const res = await request(app)
      .get("/api/v1/posts/me")
      .set("Authorization", `Bearer ${tokenA}`);
    //  expect length 1, and expect the title to be A's, not B's
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].title).toBe("Test Post");
  });

  it("filters by state", async () => {
    //  create two posts, publish one of them
    const { token } = await createUserAndToken();
    const post1 = await createPost(token);

    const post2 = await createPost(token, { title: "second post" });

    await request(app)
      .patch(`/api/v1/posts/${post1._id}/publish`)
      .set("Authorization", `Bearer ${token}`);
    const res = await request(app)
      .get("/api/v1/posts/me?state=draft")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].state).toBe("draft");
  });

  it("rejects an invalid state", async () => {
    const { token } = await createUserAndToken();

    const res = await request(app)
      .get("/api/v1/posts/me?state=banana")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  it("paginates", async () => {
    const { token } = await createUserAndToken();

    await createPost(token, { title: "Post 1" });
    await createPost(token, { title: "Post 2" });
    await createPost(token, { title: "Post 3" });

    const res1 = await request(app)
      .get("/api/v1/posts/me?limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.posts).toHaveLength(2);
    expect(res1.body.totalPost).toBe(3);

    const res2 = await request(app)
      .get("/api/v1/posts/me?limit=2&page=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.posts).toHaveLength(1);
  });
});
