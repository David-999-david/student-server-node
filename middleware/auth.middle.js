const { verifyAccessToken } = require("../service/auth/token.service");

async function checkAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/i);

  if (!match) {
    return res.status(401).json({
      error: true,
      code: "No_Token",
      message: "Missing Bearer token",
    });
  }
  const token = match[1];
  try {
    const payload = verifyAccessToken(token);

    req.user = { id: payload.sub };
    return next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({
        error: true,
        code: "Token_Expire",
        message: "Access token is expired!",
      });
    }
    return res.status(401).json({
      error: true,
      code: "Invalid_Token",
      message: "Invalid access token",
    });
  }
}

module.exports = checkAuth;
