//require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const request = require("request");

const {
  User,
  UserData,
  Teacher,
  Student,
  Class,
  StudentData,
  Teat,
  Status,
  Questio,
  QTM,
  Score,
} = require("./modal");

const loginError = `<div class="messages error"><div class="messages-container"><div class="message-text" aria-invalid="1" tabindex="-1" >Error: The email address and password combination you entered cannot be recognized or does not exist. Please try again.</div></div></div>`;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

passport.use("teacherlocal", new LocalStrategy(Teacher.authenticate()));

passport.use("userlocal", new LocalStrategy(User.authenticate()));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  if (user != null) done(null, user);
});

app.get("/", function (req, res) {
  //res.render("home");
  res.send("ih");
});

app.listen(3000, function () {
  console.log("server started 3000");
});
