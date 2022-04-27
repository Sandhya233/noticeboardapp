const express = require("express");
const router = new express.Router();
const User = require("../models/users");
const Notice = require("./models/notice");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const req = require("express/lib/request");
const res = require("express/lib/response");
//create notice
router.post(
  "/notice",
  [
    check("title").notEmpty().withMessage("Notice must have a title"),
    check("description")
      .notEmpty()
      .withMessage("Notice must have a description"),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var allError = {};
      errors.errors.forEach(function (err) {
        allErrors[err.params] = err.msg;
      });
      return res.json({
        staus: "fail",
        data: allErrors,
      });
      const notice = new notice({
        ...req.body,
        author: req.user._id,
      });
      try {
        await notice.save();
        res.staus(201).json({ status: "success", data: { posts: notice } });
      } catch (error) {
        res.status.send({
          status: "error",
          message: " error occured please try again",
        });
      }
    }
  }
);
//read notice
router.get("/notice", async (req, res) => {
  try {
    const notice = await Notice.find({});
    res.json({ status: "success", data: { posts: notice } });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Server error",
    });
  }
});
//updating notice
router.patch("/notice/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "description"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }
});
//deleting notice
router.delete("/notice/:id", auth, async (req, res) => {
  const notice = await Notice.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });
});
module.exports = router;
