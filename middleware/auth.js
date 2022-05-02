const jwt = require("jsonwebtoken");
const User = require("../models/users");
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("User not logged in");
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(400).send("User not logged in");
  }
};
const admin = (req, res, next) => {};
module.exports = auth;
