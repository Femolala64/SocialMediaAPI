const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Invalid Authorization",
      });
    }
    const token = authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "The account was deleted after the token was issued ",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Invalid Token",
    });
  }
};

module.exports = protect;
