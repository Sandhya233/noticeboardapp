const jwt = require("jsonwebtoken");
const User = require("../models/users");
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw newError();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(400).send(error);
  }
};
const admin = (req, res, next) => {};
module.exports = auth;
