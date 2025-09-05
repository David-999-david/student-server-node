const { success } = require("zod");
const {
  getGender,
  getJoinStudentsQuery,
  getJoinStudents,
  newStudents,
  updateStudent,
  studentExist,
  getJoinStudentId,
  deleteS,
} = require("../../service/student/student.service");
const ApiError = require("../../utils/ApiError");

async function allGender(req, res, next) {
  try {
    const genders = await getGender();
    return res.status(200).json({
      count: genders.length,
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

async function getJoinSId(req, res, next) {
  const { id } = req.params;
  try {
    const result = await getJoinStudentId(id);
    if (!result) {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Can't find student with id=${id}`,
      });
    }
    return res.status(200).json({
      error: false,
      success: true,
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function addStudents(req, res, next) {
  const student = req.body;
  try {
    result = await newStudents(student);
    return res.status(201).json({
      error: false,
      success: true,
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function editStudent(req, res, next) {
  const { id } = req.params;
  const student = req.body;
  try {
    const exist = await studentExist(id);

    if (!exist) {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Student with id=${id} not found`,
      });
    }

    const result = await updateStudent(id, student);

    return res.status(200).json({
      error: false,
      success: true,
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function removeStudent(req, res, next) {
  const {id} = req.params;
  try {
    await deleteS(id);
    return res.status(200).json({
      error: false,
      success: true,
      data: `Delete student with id=${id} success!`
    })
  }
   catch (e){
    next(e);
   }
}

module.exports = { allGender, getJoinS, getJoinSId, addStudents, editStudent , removeStudent };
