const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const bcrypt = require("bcrypt");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("./token.service");

async function createUser(user) {
  const eSql = `select 1 from users where email =$1`;
  const sql = `insert into users
    (name,email,password)
    values
    ($1,$2,$3)
    returning id,name,email
    `;
  try {
    const eRes = await db.query(eSql, [user.email]);
    if (eRes.rowCount === 1) {
      throw new ApiError(403, `${user.email} has Already taken!`);
    }
    const passwordHash = await bcrypt.hash(user.password, 12);
    const cRes = await db.query(sql, [user.name, user.email, passwordHash]);
    if (cRes.rowCount !== 1) {
      throw new ApiError(500, "Failed to create user");
    }
    const payload = cRes.rows[0];
    const access = signAccessToken(payload.id);
    const refresh = signRefreshToken(payload.id);

    return { access, refresh, payload };
  } catch (e) {
    throw new ApiError(e.status, e.message);
  }
}

async function refreshS(oldRefresh) {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefresh);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh Token");
  }
  const userId = decoded.sub;
  const access = signAccessToken(userId);
  const refresh = signRefreshToken(userId);

  return { access, refresh };
}

async function loginS(user) {
  const eSql = `
    select id, password from users
    where email = $1
    `;
  try {
    const eRes = await db.query(eSql, [user.email]);
    if (eRes.rowCount !== 1) {
      throw new ApiError(404, `User with email=${user.email} not found!`);
    }
    const inpuPsw = user.password;
    const password = eRes.rows[0].password;

    const match = await bcrypt.compare(inpuPsw, password);
    if (!match) {
      throw new ApiError(403, "Password is incorrect!");
    }
    const userId = eRes.rows[0].id;
    const access = signAccessToken(userId);
    const refresh = signRefreshToken(userId);

    return { access, refresh };
  } catch (e) {
    throw new ApiError(e.status, e.message);
  }
}

module.exports = { createUser, refreshS, loginS };
