require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL;
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL;

function signAccessToken(userId) {
  const payload = { sub: userId };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken(userId) {
  const payload = { sub: userId };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

// function hashToken(token) {
//   return crypto.createHash("sha256").update(token).digest("hex");
// }

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
//   hashToken,
};
