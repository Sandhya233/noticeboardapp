const express = require("express");
const router = new express.Router();
const User = require("../models/users");
const Notice = require("../models/notice");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { update } = require("../models/users");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });
//create notice
router.post(
  "/notice",
  upload.single("officelogo"),
  [
    check("title").notEmpty().withMessage("Notice must have a title"),
    check("description")
      .notEmpty()
      .withMessage("Notice must have a description"),
  ],
  auth,
  async (req, res) => {
    console.log(req.file);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var allErrors = {};
      errors.errors.forEach(function (err) {
        allErrors[err.params] = err.msg;
      });
      return res.json({
        staus: "fail",
        data: allErrors,
      });
    }
    const notice = new Notice({
      ...req.body,
      author: req.user._id,
    });
    try {
      await notice.save();
      res.status(201).json({ status: "success", data: { posts: notice } });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: "error",
        message: " error occured please try again",
      });
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
//get notice by logged in users only
router.get("/notice/me", auth, async (req, res) => {
  try {
    await req.user.populate("notices").execPopulation();
    res.json({ status: "success", data: { posts: notice } });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

//updating notice
router.patch("/notice/:id", auth, async (req, res) => {
  /*const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "description"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }?*/
  try {
    /*const notice = await Notice.findOne({
      id: req.params.id,
      author: req.user._id,
    });
    updates.forEach((update) => (notice[update] = req.body[update]));
    await notice.save();
    if (!notice) {
      return res.response(404).send();
    }
    res.send(notice);*/
    if (req.user.role === "admin") {
      const notice = await Notice.findByIdAndUpdate(
        req.params.id,
        req.user._id,
        {
          new: true,
          runValidators: true,
        }
      );
      return res.json({
        status: "success",
        data: { post: notice },
        messsage: "updated by Admin",
      });
    } else if (req.user.role === "basic") {
      const notice = await Notice.findOneAndUpdate(
        {
          id: req.params.id,
          author: req.user._id,
        },
        req.body,
        { new: true, runValidators: true }
      );
      if (!notice) {
        return res.status(400).json({
          status: "fail",
          data: {
            posts: "couldnot find the Notice with this id or unAuthorizated",
          },
        });
      }
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: "Server error" });
  }
});
//deleting notice
router.delete("/notice/:id", auth, async (req, res) => {
  /* const notice = await Notice.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });*/
  try {
    if (req.user.role === "admin") {
      const notice = await Notice.findByIdAndDelete(
        req.params.id,
        req.user._id,
        {
          new: true,
          runValidators: true,
        }
      );
      return res.json({
        status: "success",
        data: { post: notice },
        messsage: "deleted by Admin",
      });
    } else if (req.user.role === "basic") {
      const notice = await Notice.findOneAndDelete({
        id: req.params.id,
        author: req.user._id,
      });
      return res.json({
        status: "success",
        data: { post: notice },
        messsage: "deleted successfully by author ",
      });
      if (!notice) {
        return res.status(400).json({
          status: "fail",
          data: {
            posts: "couldnot find the Notice with this id or unAuthorizated",
          },
        });
      }
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: "Server error" });
  }
});
module.exports = router;
