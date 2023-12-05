const express = require("express");
const app = express();
const cors = require("cors");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI);

const userSchema = new Schema({
  username: {
    required: true,
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

const exerciseSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: Date,
  user: mongoose.ObjectId,
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", async (req, res) => {
  let users = await User.find().select("username");
  return res.json(users);
});
app.post("/api/users", async (req, res) => {
  let username = req.body.username;
  const user = new User({ username: username });
  await user.save();
  return res.json(user);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  let userId = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  if (!date) {
    date = new Date();
  }
  const exercise = new Exercise({
    description: description,
    duration: duration,
    date: date,
    user: userId,
  });
  await exercise.save();
  let user = await User.findById(userId);
  return res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: userId,
  });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  let user = await User.findById(req.params._id).select("username");
  if (!user) {
    res.send({ error: "User not found" });
  }
  let queryParams = { user: req.params._id };
  if (req.query.from) {
    queryParams.date = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to),
    };
  }
  let limitInput = req.query.limit ? parseInt(req.query.limit) : 0;

  let exercises = await Exercise.find(queryParams)
    .select("-_id description duration date")
    .limit(limitInput);

  let log = [];
  for (const element of exercises) {
    log.push({
      description: element.description,
      duration: element.duration,
      date: element.date.toDateString(),
    });
  }

  res.send({
    _id: user.id,
    username: user.username,

    count: exercises.length,
    log: log,
  });
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
