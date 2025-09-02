const {
  getGender,
  getJoinStudents,
  getJoinStudentsQuery,
} = require("../../controller/student/student.controller");

async function allGender(req, res, next) {
  try {
    const genders = await getGender();
    return res.status(200).json({
      error: false,
      success: true,
      data: genders,
    });
  } catch (e) {
    next(e);
  }
}

async function getJoinS(req, res, next) {
  const query = req.query.q;
  try {
    let students;
    if (query) {
      students = await getJoinStudentsQuery(query);
    } else {
      students = await getJoinStudents();
    }
    return res.status(200).json({
      count: students.length,
      error: false,
      success: true,
      data: students,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { allGender, getJoinS };
