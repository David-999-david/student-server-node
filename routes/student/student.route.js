const {
  allGender,
  getJoinS,
} = require("../../service/student/student.service");

const router = require("express").Router();

router.get("/genders", allGender);

router.get("", getJoinS);

module.exports = router;
