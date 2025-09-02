const { getJoinC } = require("../../service/course/course.service");

const router = require("express").Router();

router.get("", getJoinC);

module.exports = router;
