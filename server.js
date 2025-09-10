const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const pool = require("./config/db");
const router = require("./routes");
const logger = require("./libs/logger");
const ErrorHandler = require("./middleware/errorHandler");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: logger.stream,
  })
);

app.use("/api", router);

app.use(ErrorHandler);

async function CheckConnection() {
  try {
    const client = await pool.connect();
    client.release();
    logger.info("Success => connect with database");
  } catch (e) {
    logger.warn("Error => connect with database");
    process.exit(1);
  }
}

const PORT = process.env.PORT || 3000;

CheckConnection().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
});
