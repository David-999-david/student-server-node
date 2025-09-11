const {
  register,
  refresh,
  login,
  logout,
} = require("../../controller/auth/auth.controller");
const validate = require("../../middleware/validate");
const { RegisterSchema, LoginSchema } = require("../../validators/user.schema");

const router = require("express").Router();

router.post("/register", validate(RegisterSchema, "body"), register);

router.post("/refresh", refresh);

router.post("/login", validate(LoginSchema, "body"), login);

router.post("/logout", logout);

module.exports = router;
