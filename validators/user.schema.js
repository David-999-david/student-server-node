const { z } = require("zod");

const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Username is required"),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(6, "Password must be at least 6"),
}).strict();

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(6, "Password must be at least 6"),
}).strict();

module.exports = { RegisterSchema, LoginSchema };
