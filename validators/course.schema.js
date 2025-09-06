const { z } = require("zod");

const CourseFields = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  status: z.coerce.boolean(),
  student_limit: z.coerce
    .number()
    .int()
    .min(5, "Course Limit must be at least 5"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
});

const CourseIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const CreateCourseSchema = CourseFields.strict();

const UpdateCourseSchema = CourseFields.partial()
  .strict()
  .refine((o) => Object.keys(o).length > 0, {
    message: "At least one field require for update!",
  });

module.exports = { CourseIdSchema, CreateCourseSchema, UpdateCourseSchema };
