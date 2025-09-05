const { getJoinC } = require("../../controller/course/course.controller");

const router = require("express").Router();

router.get("", getJoinC);

module.exports = router;
