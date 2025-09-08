const {
  getJoinCourses,
  getJoinCoursesQuery,
  addCourse,
  getIdC,
  updateC,
  deleteC,
  joinSIds,
} = require("../../service/course/course.service");

async function getJoinC(req, res, next) {
  const query = req.query.q;
  const page = Math.max(1, Number(req.query.p ?? 1));
  const limit = Math.min(100, Number(req.query.l ?? 20));
  const offset = (page - 1) * limit;
  try {
    let results;
    if (query) {
      results = await getJoinCoursesQuery(query, limit, offset);
    } else {
      results = await getJoinCourses(limit, offset);
    }
    const { courses, count } = results;
    const totalPages = Math.max(1, Math.ceil(count / limit));
    return res.status(200).json({
      error: false,
      success: true,
      meta: { count, totalPages },
      data: courses,
    });
  } catch (e) {
    next(e);
  }
}

async function newCourse(req, res, next) {
  const course = req.body;
  try {
    const Res = await addCourse(course);
    return res.status(201).json({
      error: false,
      success: true,
      data: Res,
    });
  } catch (e) {
    next(e);
  }
}

async function findIdC(req, res, next) {
  const { id } = req.params;
  try {
    const result = await getIdC(id);
    return res.status(200).json({
      error: false,
      success: true,
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function updateCourse(req, res, next) {
  const { id } = req.params;
  const course = req.body;
  try {
    const result = await updateC(id, course);
    return res.status(200).json({
      error: false,
      success: true,
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function deleteCourse(req, res, next) {
  const { id } = req.params;
  try {
    await deleteC(id);
    return res.status(200).json({
      error: false,
      success: true,
      message: `Delete course with id =${id} success`,
    });
  } catch (e) {
    next(e);
  }
}

async function joinStudents(req, res, next) {
  const { id } = req.params;
  const { studentIds } = req.body;
  try {
    const result = await joinSIds(id, studentIds);
    return res.status(200).json({
      error: false,
      success: true,
      data: result
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getJoinC,
  newCourse,
  findIdC,
  updateCourse,
  deleteCourse,
  joinStudents,
};
