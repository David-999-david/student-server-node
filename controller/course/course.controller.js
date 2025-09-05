const {
  getJoinCourses,
  getJoinCoursesQuery,
} = require("../../service/course/course.service");

async function getJoinC(req, res, next) {
  const query = req.query.q;
  try {
    let courses;
    if (query) {
      courses = await getJoinCoursesQuery(query);
    } else {
      courses = await getJoinCourses();
    }
    return res.status(200).json({
      count: courses.length,
      error: false,
      success: true,
      data: courses,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getJoinC };
