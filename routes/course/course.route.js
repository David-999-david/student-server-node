const {
  getJoinC,
  newCourse,
  findIdC,
  updateCourse,
  deleteCourse,
  joinStudents,
} = require("../../controller/course/course.controller");
const validate = require("../../middleware/validate");
const {
  CreateCourseSchema,
  CourseIdSchema,
  UpdateCourseSchema,
  JoinStudentsIds,
} = require("../../validators/course.schema");

const router = require("express").Router();

router.get("", getJoinC);

router.post("", validate(CreateCourseSchema), newCourse);

router.get("/:id", validate(CourseIdSchema, "params"), findIdC);

router.put(
  "/:id",
  validate(CourseIdSchema, "params"),
  validate(UpdateCourseSchema),
  updateCourse
);

router.delete("/:id", validate(CourseIdSchema, "params"), deleteCourse);

router.post("/:id/join",
  validate(CourseIdSchema, "params"),
  validate(JoinStudentsIds),
  joinStudents
)

module.exports = router;
