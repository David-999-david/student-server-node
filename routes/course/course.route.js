const {
  getJoinC,
  newCourse,
  findIdC,
  updateCourse,
  deleteCourse,
  joinStudents,
  cancelJoinC,
} = require("../../controller/course/course.controller");
const validate = require("../../middleware/validate");
const {
  CreateCourseSchema,
  CourseIdSchema,
  UpdateCourseSchema,
  JoinStudentsIds,
} = require("../../validators/course.schema");
const { StudentIdSchema } = require("../../validators/student.schema");

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

router.delete("/:id/join/cancel",
  validate(CourseIdSchema, "params"),
  cancelJoinC
)

module.exports = router;
