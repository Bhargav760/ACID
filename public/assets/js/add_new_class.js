// <?php
// 	include "../../database/config.php";
//     $class_name = $_POST['class_name'];
//     $starting_roll_number = $_POST['starting_roll_number'];
//     $ending_roll_number = $_POST['ending_roll_number'];
//     $class_id ;
//     $sql = "INSERT INTO classes (name)
//     VALUES ('".$class_name."')";

//import { default as mongoose } from "mongoose";

//     if (mysqli_query($conn, $sql)) {
//         $id = "SELECT id  FROM classes where name = '".$class_name."' limit 1";
//         $result = mysqli_query($conn, $id);

//         if (mysqli_num_rows($result) >
// 0) { // output data of each row while($row = mysqli_fetch_assoc($result)) {
// $class_id = $row['id']; } for ($x = $starting_roll_number; $x <=
// $ending_roll_number; $x++) { $insert_roll_numbers = "INSERT INTO student_data
// (rollno, class_id) VALUES ('".$x."', $class_id)"; mysqli_query($conn,
// $insert_roll_numbers); } echo "Success"; } else { echo "Failure"; } } else {
// echo "Error: " . $sql . "<br />" . mysqli_error($conn); } mysqli_close($conn);
// ?>

//import { MongoClient } from "mongodb";
var url = "mongodb://localhost:27017/";

const student_data = new mongoose.Schema({
  _id: { Number },
  rollno: { Number },
  class_id: { Number },
});
const Student_data = mongoose.model("student_data", student_data);

function add_new_class(name, starting_roll_number, ending_roll_number) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("userDB");
    var myobj = { name: name };
    dbo.collection("classes").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
    dbo.collection("classes").find({ name: name }, function (err, docs) {
      if (err != null) {
        console.log(`Error occured ${err}`);
      } else if (docs != null) {
        console.log(`Found ${docs}`);
        classId = dcos._id;
        var studentList = [];
        for (x = starting_roll_number; x <= ending_roll_number; x++) {
          const data = new Student_data({
            rollno: x,
            class_id: classId,
          });
          studentList.push(data);
        }
        dbo
          .collection("student_data")
          .insertMany(studentList, function (err, res) {
            if (err) {
              console.log(err);
            } else if (res != null) {
              console.log(res.insertedCount);
            } else {
              console.log("not inserted");
            }
          });
      } else {
        console.log(`not Found ${docs}`);
      }
    });
  });

  //   MongoClient.connect(url, function (err, db) {
  //     if (err) throw err;
  //     var dbo = db.db("userDB");
  //     var myobj = [];
  //     dbo.collection("customers").insertMany(myobj, function (err, res) {
  //       if (err) throw err;
  //       console.log("Number of documents inserted: " + res.insertedCount);
  //       db.close();
  //     });
  //   });
}
