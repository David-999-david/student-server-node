const { register, refresh } = require("../../controller/auth/auth.controller");
const validate = require("../../middleware/validate");
const { RegisterSchema } = require("../../validators/user.schema");

const router = require("express").Router();

// router.post("/login");

router.post("/register", validate(RegisterSchema, "body"), register);

router.post("/refresh", refresh);

module.exports = router;
