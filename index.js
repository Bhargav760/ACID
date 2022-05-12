//require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const request = require("request");
var ObjectID = require('mongodb').ObjectID;

var sess;
const {
  User,
  UserData,
  Teacher,
  Student,
  Class,
  Student_data,
  Test,
  Status,
  Questio,
  QTM,
  Score,
  Question,
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
    cookie: { maxAge: 600000 },
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
  res.render("home");
});


app.get("/login", function (req, res) {
  res.render("login", { error: "" });
});

app.get("/loginT", function (req, res) {
  res.render("loginT", { error: "" });
});

app.get("/sign_up", function (req, res) {
  res.render("sign_up", { error: "" });
});

app.get("/homePage", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("homePage");
  } else {
    res.redirect("/login");
  }
});

app.get("/homePageTeacher", function (req, res) {
  if (req.isAuthenticated()) {
    sess = req.session;
    console.log(sess.uid);
    Test.find({ teacher_id: sess.uid }, function (err, docs) {
      //console.log(docs);
      if (err != null) {
        console.log(`Error occured ${err}`);
        res.render("homePageTeacher", { data: null });
      } else if (docs != null && docs.length != 0) {
        // console.log(`Found ${docs}`);
        // console.log(docs);
        res.render("homePageTeacher", { data: docs });
      } else {
        //console.log(`not Found ${docs}`);
        res.render("homePageTeacher", { data: null });
      }
    });
  } else {
    res.redirect("/loginT");
  }
});

app.get("/add_data", function (req, res) {
  if (req.isAuthenticated()) {
    Class.find({}, function (err, docs) {
      console.log(docs);
      res.render("add_data", { classList: docs });
    });
  } else {
    res.redirect("/loginT");
  }
});

app.get("/view_data", function (req, res) {
  if (req.isAuthenticated()) {
    const fun1 = async () => {
      a = await UserData.find({});

      res.render("view_data", {
        user: a,
      });
    };
    fun1();
  } else {
    res.redirect("/loginT");
  }
});

app.get("/new_test", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("new_test");
  } else {
    res.redirect("/loginT");
  }
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/logout", function (req, res) {
  res.redirect("/login");
});
app.post("/create_test", function (req, res) {
  sess = req.session;
  console.log(sess.uid);
  const test = new Test({
    teacher_id: sess.uid,
    name: req.body.test_name,
    date: req.body.test_date,
    subject: req.body.subject_name,
    total_questions: req.body.total_questions,
  })
  test
    .save()
    .then(() => {
      console.log("sucess");
    })
    .catch(() => {
      console.log("error");
    });
  res.redirect("/homePageTeacher");

});
app.get("/Student", function (req, res) {
  sess = req.session;
  console.log(sess.uid);
  Test.find({ teacher_id: sess.uid }, function (err, docs) {
    //console.log(docs);
    if (err != null) {
      console.log(`Error occured ${err}`);

    } else if (docs != null && docs.length != 0) {
      console.log(docs);
      res.render("Student", { data: docs });
    } else {
      console.log(`not Found ${docs}`);
      res.render("Student", { data: null });
    }

  })
})

app.post("/get_dashboard_contents", function (req, res) {});

app.post("/sign_up", function (req, res) {
  const teacher = new Teacher({
    username: req.body.username,
    password: req.body.password,
  });
  Teacher.register(teacher, req.body.password, function (err, user) {
    console.log(err, user);
    if (err) {
      console.log(err);
      res.render("sign_up", {
        error: `A user with the given username is already registered`,
      });
    } else {
      passport.authenticate("teacherlocal")(req, res, function () {
        console.log(user);
        res.redirect("/loginT");
      });
    }
  });
});

app.post("/loginTeacher", function (req, res) {
  console.log(req.body);
  const teacher = new Teacher({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(teacher, function (err) {
    if (err) {
      console.log(err, `error`);
      res.render("login", { error: loginError });
    } else {
      passport.authenticate("teacherlocal")(req, res, function () {
        sess = req.session;

        Teacher.findOne({ username: teacher.username }, function (err, docs) {
          console.log(docs._id);
          sess.uid = docs._id;
          res.redirect("/homePageTeacher");
        });
      });
    }
  });
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  console.log(user.username, user.password);

  moodle(user.username, user.password, req, res, user);
});

//MoodleApi
const moodle = function (prn, password, req, res1, user) {
  const url = `http://115.247.20.236/moodle/login/token.php?username=${prn}&password=${password}&service=moodle_mobile_app&moodlewsrestformat=json`;
  request({ url }, (error, response) => {
    const data = JSON.parse(response.body);

    if (data.error) {
      console.log(`Error ${data.error}`);
      res1.render("login", { error: loginError });
    } else {
      const qurl = `http://115.247.20.236/moodle/webservice/rest/server.php?wstoken=${data.token}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`;
      request({ url: qurl }, (error, res) => {
        const Mdata = JSON.parse(res.body);

        const userData = new UserData({
          _id: Mdata.userid,
          clgName: Mdata.sitename,
          prn: Mdata.username.substr(12),
          branch: Mdata.firstname,
          name: Mdata.lastname.substr(Mdata.lastname.indexOf(" ") + 1),
        });

        //console.log(user);

        User.findById(userData._id, function (err, docs) {
          if (err != null) {
            console.log(`Error occured ${err}`);
          } else if (docs != null) {
            console.log(`User Found ${docs}`);
            req.login(user, function (err) {
              if (err) {
                console.log(err);
              } else {
                passport.authenticate("userlocal")(req, res, function () {
                  res.redirect("/homePage");
                });
              }
            });
          } else {
            console.log(`User not Found ${docs}`);
            User.register(
              { _id: userData._id, username: userData.prn },
              password,
              function (err, user) {
                if (err) {
                  console.log(err);
                  res1.redirect("login", { error: loginError });
                } else {
                  userData.save(function (err, result) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(result);
                    }
                  });
                  passport.authenticate("userlocal")(req, res, function () {
                    res1.redirect("/homePage");
                  });
                }
              }
            );
          }
        });

      });
    }
  });
};

app.post('/add_extra_student', function(req, res){
  Class.findOne({name : req.body.class_name}, function(err, docs){
    var userDetails = new Student_data({
      rollno: req.body.extra_roll_number,
      class_id: docs._id,
      _id: new ObjectID(),
    });
    userDetails.save((err, doc) => {
      if (!err) {
          res.status(200).end();
      }
      else {
        res.status(400).end();
        console.log(err);
      }
    });
  });
});

app.post("/add_new_class", function(req, res) {
  Class.findOne({ name: req.body.class_name }, function (err, docs) {
      if (err != null) {
        console.log(`Error occured ${err}`);
      } else if (docs != null) {
        console.log(docs);
        classId = docs._id;
        var studentList = [];
        for (x = req.body.starting_roll_number; x <= req.body.ending_roll_number; x++) {
          const data = new Student_data({
            rollno: x,
            class_id: classId,
          });
          studentList.push(data);
        }
        Student_data
          .insertMany(studentList, function (err, res1) {
            if (err) {
              console.log(err);
              res.status(400).end();
            } else if (res1 != null) {
              console.log(res.insertedCount);
              res.status(200).end();
            } else {
              console.log("not inserted");
              res.status(400).end();
            }
          });
      } else {
        console.log(`not Found ${docs}`);
        res.status(400).end();
      }
    });
  });

app.get("/test_details", function(req, res){
  if (req.isAuthenticated()) {
    Question.find({}, function(err, docs){
      if(err!=null) {
        console.log(err);
        res.render("test_details", {data : null});
      } else if(docs!=null && docs.length != 0) {
        console.log(docs);
        res.render("test_details", {data : docs});
      } else {
        res.render("test_details", {data : null});
      }
    });
  } else {
    res.redirect("/loginT");
  }
});

app.get('/add_question', function(req, res) {
  if(req.isAuthenticated()) {
  res.render('add_question');
    } else res.render('/loginT');
});

app.post('/add_question', function(req, res){
  console.log(req.body);
  const question = new Question({
    title: req.body.title,
    correctAns:req.body.correct_answer,
    score: req.body.score,
    _id: new ObjectID()
  });
  question.save((err, doc) => {
    if (!err) {
        res.status(200).end();
    }
    else {
      res.status(400).end();
      console.log(err);
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
