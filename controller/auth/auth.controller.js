const { decode } = require("jsonwebtoken");
const { createUser, refreshS } = require("../../service/auth/auth.service");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/api/auth/refresh",
  maxAge: 1200000,
};

async function register(req, res, next) {
  const user = req.body;
  try {
    const { access, refresh, payload } = await createUser(user);

    if (refresh) res.cookie("refresh_token", refresh, COOKIE_OPTS);
    const { exp } = decode(access);
    const expiresIn = new Date(exp * 1000);
    return res.status(201).json({
      error: false,
      success: true,
      access_token: access,
      data: payload,
      expiresIn,
    });
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const oldRefresh = req.cookies?.refresh_token;
    if (!oldRefresh)
      return res.status(401).json({
        error: "No refresh token ",
      });
    const { access, refresh } = await refreshS(oldRefresh);

    if (refresh) res.cookie("refresh_token", refresh, COOKIE_OPTS);
    const { exp } = decode(access);
    const expiresIn = new Date(exp * 1000);
    return res.status(200).json({
      error: false,
      success: true,
      access_token: access,
      expiresIn,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, refresh };
