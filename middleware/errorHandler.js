const logger = require("../libs/logger");
const { stack } = require("../routes");

function ErrorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal Server error";
  logger.error(message, { status, stack: err.stack });
  return res.status(status).json({
    success: false,
    message,
  });
}

module.exports = ErrorHandler;
