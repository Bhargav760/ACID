// Requiring module
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// Course Modal Schema
const userSchema = new mongoose.Schema(
  {
    _id: {},
    name: {},
    password: {},
  },
  {
    timestamps: true,
  }
);

// Student Modal Schema
const userDataSchema = new mongoose.Schema(
  {
    _id: {},
    clgName: String,
    prn: String,
    branch: String,
    name: String,
    classId: [],
  },
  {
    timestamps: true,
  }
);

const students = new mongoose.Schema({
  _id: {},
  test_id: {  },
  rollno: {  },
  password: {  },
  score: {  },
  status: {  },
});

const teacherSchema = new mongoose.Schema(
  {
    _id: {},
    username: {  },
    password: {  },
    verified: false,
  },
  {
    timestamps: true,
  }
);

const classesSchema = new mongoose.Schema({
  _id: {},
  name: { String },
});

const testsSchema = new mongoose.Schema({
  _id: {},
  teacher_id: {},
  name: {  },
  date: { type: Date, default: Date.now },
  status_id: {  },
  subject: {  },
  total_questions: {  },
  class_id: {  },
});

const status = new mongoose.Schema({
  _id: {},
  name: {  },
});

const questionsSchema = new mongoose.Schema({
  _id: {},
  title: {},
  correctAns: {},
  score: {},
});

const question_test_mapping = new mongoose.Schema({
  question_id: {},
  test_id: {},
});

const score = new mongoose.Schema({
  _id: {},
  test_id: {},
  question_id: {},
  correct_count: {  },
  wrong_count: {  },
});

const student_data = new mongoose.Schema({
  _id: {},
  rollno: {},
  class_id: {},
});

userSchema.plugin(passportLocalMongoose);
teacherSchema.plugin(passportLocalMongoose);

// Creating model objects
const User = mongoose.model("user", userSchema);
const UserData = mongoose.model("userData", userDataSchema);
const Teacher = mongoose.model("teacher", teacherSchema);
const Student = mongoose.model("student", students);
const Class = mongoose.model("class", classesSchema);
const Test = mongoose.model("test", testsSchema);
const Status = mongoose.model("status", status);
const QTM = mongoose.model("question_test_mapping", question_test_mapping);
const Question = mongoose.model("question", questionsSchema);
const Score = mongoose.model("score", score);
const Student_data = mongoose.model("student_data", student_data);

// Exporting our model objects
module.exports = {
  User,
  UserData,
  Teacher,
  Student,
  Class,
  Test,
  Status,
  Question,
  QTM,
  Score,
  Student_data
};
