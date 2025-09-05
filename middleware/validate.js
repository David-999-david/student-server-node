const { loggers } = require("winston");
const { ZodError } = require("zod");

function validate(schema, property = "body") {
  return (req, res, next) => {
    try {
      req[property] = schema.parse(req[property]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        console.log(err.message)
        return res.status(422).json({
          error: true,
          success: false,
          message: "Validation error",
          errors: err.flatten(),
        });
      }
      next(err);
    }
  };
}

module.exports = validate;
