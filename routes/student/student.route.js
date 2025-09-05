const {
  allGender,
  getJoinS,
  addStudents,
  editStudent,
  getJoinSId,
  removeStudent,
} = require("../../controller/student/student.controller");
const validate = require("../../middleware/validate");
const {
  CreateStudentSchema,
  StudentIdSchema,
  UpdateStudentSchema,
} = require("../../validators/student.schema");

const router = require("express").Router();

router.get("/genders", allGender);

router.get("", getJoinS);

router.get("/:id", validate(StudentIdSchema, "params"), getJoinSId);

router.post("", validate(CreateStudentSchema), addStudents);

router.put(
  "/:id",
  validate(StudentIdSchema, "params"),
  validate(UpdateStudentSchema, "body"),
  editStudent
);

router.delete(
  '/:id',
  validate(StudentIdSchema, "params"),
  removeStudent
)

module.exports = router;
