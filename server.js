require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Notice = require("./routes/notice");
const noticeRouter = require("./routes/notice");
const userRouter = require("./routes/user");
const app = express();
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));
app.use(express.json());
app.use(noticeRouter);
app.use(userRouter);
app.listen(3000, () => {
  console.log("Server has started in port 3000");
});
