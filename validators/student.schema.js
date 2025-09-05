const { z } = require("zod");

const StudentFields = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().lowercase().email(),
  phone: z.string().trim().min(8, "Must be at least 8"),
  address: z.string().min(1, "Address is required"),
  gender_id: z.coerce
    .number()
    .max(3, "At current time, there is only have 3 gender type"),
  status: z.coerce.boolean(),
});

const StudentIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const CreateStudentSchema = StudentFields.strict();

const UpdateStudentSchema = StudentFields.partial()
  .strict()
  .refine((o) => Object.keys(o).length > 0, {
    message: "At least one field require for update!",
  });
module.exports = { CreateStudentSchema, UpdateStudentSchema, StudentIdSchema };
