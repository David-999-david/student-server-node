const { getJoinC, newCourse } = require("../../controller/course/course.controller");
const validate = require("../../middleware/validate");
const { CreateCourseSchema } = require("../../validators/course.schema");

const router = require("express").Router();

router.get("", getJoinC);

router.post('',
    validate(CreateCourseSchema),
    newCourse
)

module.exports = router;
