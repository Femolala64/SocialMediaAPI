const express = require("express");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const followRoutes = require("./routes/follow");
const likeRoutes = require("./routes/like");
const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/follows", followRoutes);
app.use("/api/v1/likes", likeRoutes);

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

module.exports = app;
