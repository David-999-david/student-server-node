const { z } = require("zod");

const CreateStudentScheam = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8, "Must be at least 8"),
  address: z.string().min(1, "Address is required"),
  gender: z.string(),
  status: z.boolean(),
});
