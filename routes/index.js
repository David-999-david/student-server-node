const router = require("express").Router();
const student = require("../routes/student/student.route");
const course = require("../routes/course/course.route");

router.use("/students", student);

router.use("/courses", course);

module.exports = router;
