const router = require("express").Router();
const student = require("../routes/student/student.route");
const course = require("../routes/course/course.route");
const auth = require("../routes/auth/auth.route");

router.use("/students", student);

router.use("/courses", course);

router.use("/auth", auth);

module.exports = router;
