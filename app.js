const express = require("express");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");

const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

module.exports = app;
