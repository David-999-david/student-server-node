const {
  getJoinC,
  newCourse,
  findIdC,
  updateCourse,
} = require("../../controller/course/course.controller");
const validate = require("../../middleware/validate");
const {
  CreateCourseSchema,
  CourseIdSchema,
  UpdateCourseSchema,
} = require("../../validators/course.schema");

const router = require("express").Router();

router.get("", getJoinC);

router.post("", validate(CreateCourseSchema), newCourse);

router.get("/:id", validate(CourseIdSchema, "params"), findIdC);

router.put('/:id',validate(CourseIdSchema, "params"), 
validate(UpdateCourseSchema), updateCourse
)

module.exports = router;
