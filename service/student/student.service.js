const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");

async function getGender() {
  const sql = "select * from gender";

  const result = await db.query(sql);
  return result.rows;
}

async function getJoinStudents(limit, offset) {
  const sql = `
    select
    s.id,
    s.name,
    s.email,
    s.address,
    s.phone,
    s.status,
    g.name as "gender",
    s.created_at,
    coalesce(
    jsonb_agg(
    jsonb_build_object(
    'id',c.id,
    'name',c.name,
    'description',c.description,
    'status',c.status,
    'current_students',c.current_students,
    'student_limit',c.student_limit,
    'start_date',c.start_date,
    'end_date',c.end_date,
    'created_at',c.created_at
    )
    order by c.created_at desc
    ) filter (where c.id is not null),
     '[]'::jsonb
    ) as courses
    from student s
    left join gender g on g.id = s.gender_id
    left join student_course sc on sc.student_id = s.id
    left join course c on c.id = sc.course_id
    group by s.id,s.name,s.email,s.address,s.phone,s.status,g.name,s.created_at
    order by s.created_at desc
    limit $1 offset $2
    `;
  const results = await db.query(sql, [limit, offset]);

  const countsql = `select count(*)::int as total from student`;
  const countRes = await db.query(countsql);

  return { students: results.rows, count: countRes.rows[0].total };
}

async function getJoinStudentsQuery(query, limit, offset) {
  const pattern = `%${query}%`;
  const sql = `
    select
    s.id,
    s.name,
    s.email,
    s.address,
    s.phone,
    s.status,
    g.name as "gender",
    s.created_at,
    coalesce(
    jsonb_agg(
    jsonb_build_object(
    'id',c.id,
    'name',c.name,
    'description',c.description,
    'status',c.status,
    'current_students',c.current_students,
    'student_limit',c.student_limit,
    'start_date',c.start_date,
    'end_date',c.end_date,
    'created_at',c.created_at
    )
    order by c.created_at desc
    ) filter (where c.id is not null),
     '[]'::jsonb
    ) as courses
    from student s
    left join gender g on g.id = s.gender_id
    left join student_course sc on sc.student_id = s.id
    left join course c on c.id = sc.course_id
    where s.name ilike $1 or
    s.email ilike $1
    group by s.id,s.name,s.email,s.address,s.phone,s.status,g.name,s.created_at
    order by s.created_at desc
    limit $2 offset $3
    `;
  const results = await db.query(sql, [pattern, limit, offset]);

  const countsql = `select count(*)::int as total from student
   where name ilike $1 or email ilike $1`;
  const countRes = await db.query(countsql, [pattern]);

  return { students: results.rows, count: countRes.rows[0].total };
}

async function getJoinStudentId(id) {
  const sql = `
    select
    s.id,
    s.name,
    s.email,
    s.address,
    s.phone,
    s.status,
    g.name as "gender",
    s.created_at,
    coalesce(
    jsonb_agg(
    jsonb_build_object(
    'id',c.id,
    'name',c.name,
    'description',c.description,
    'status',c.status,
    'current_students',c.current_students,
    'student_limit',c.student_limit,
    'start_date',c.start_date,
    'end_date',c.end_date,
    'created_at',c.created_at
    )
    order by c.created_at desc
    ) filter (where c.id is not null),
     '[]'::jsonb
    ) as courses
    from student s
    left join gender g on g.id = s.gender_id
    left join student_course sc on sc.student_id = s.id
    left join course c on c.id = sc.course_id
    where s.id = $1
    group by s.id,s.name,s.email,s.address,s.phone,s.status,g.name,s.created_at
    order by s.created_at desc
    `;
  try {
    const result = await db.query(sql, [id]);
    return result.rows[0];
  } catch (e) {
    throw new ApiError(e.status || 500, e.message || "Db error");
  }
}

async function newStudents(student) {
  const sql = `
  insert into student
  (name,email,phone,address,gender_id,status)
  values
  ($1,$2,$3,$4,$5,$6)
  returning *
  `;
  try {
    const result = await db.query(sql, [
      student.name,
      student.email,
      student.phone,
      student.address,
      student.gender_id,
      student.status,
    ]);
    if (result.rowCount !== 1) {
      throw new ApiError(500, "Error when insert new student");
    }
    return result.rows[0];
  } catch (e) {
    throw new ApiError(e.status || 500, e.message || "Db error");
  }
}

async function studentExist(id) {
  const sql = `select 1 from student where id = $1`;
  const { rowCount } = await db.query(sql, [id]);
  if (rowCount !== 1) {
    return false;
  }
  return true;
}

async function updateStudent(id, student) {
  const sql = `
  update student
  set
  name = coalesce(Nullif($1,''), name),
  email = coalesce(Nullif($2,''), email),
  phone = coalesce(Nullif($3,''), phone),
  address = coalesce(Nullif($4,''), address),
  gender_id = coalesce($5, gender_id),
  status = coalesce($6, status),
  updated_at = now()
  where id = $7
  returning *
  `;
  try {
    const result = await db.query(sql, [
      student.name,
      student.email,
      student.phone,
      student.address,
      student.gender_id,
      student.status,
      id,
    ]);
    return result.rows[0];
  } catch (e) {
    throw new ApiError(e.status || 500, e.message || "Db error");
  }
}

async function deleteS(id) {
  const existSql = `select 1 from student where id =$1`;
  const deleteSql = `delete from student where id =$1`;
  const cIdsSql = `
  select
  sc.course_id
  from student_course sc
  left join student s on s.id = sc.student_id
  left join course c on c.id = sc.course_id
  where sc.student_id = $1
  `;
  const decSql = `
  update course
  set current_students = greatest(current_students - 1, 0),
  updated_at = now()
  where id = any($1::int[])
  `;
  try {
    const exist = await db.query(existSql, [id]);
    if (exist.rowCount !== 1) {
      throw new ApiError(404, `Not found student with id=${id}`);
    }
    const results = await db.query(cIdsSql, [id]);
    const courseIds = results.rows.map((r) => Number(r.course_id));

    const delesResult = await db.query(deleteSql, [id]);
    if (delesResult.rowCount !== 1) {
      throw new ApiError(500, `Failed to delete student with id=${id}`);
    }

    if (courseIds.length > 0) {
      const dec = await db.query(decSql, [courseIds]);
      if (!dec) {
        throw new ApiError(
          500,
          "Failed to decrease current_students of courses"
        );
      }
    }
  } catch (e) {
    throw new ApiError(e.status, e.message);
  }
}

async function joinCourses(sId, cIds) {
  const sSql = `
  select 1 from student where id=$1 and
  status = true
  `;
  const eSql = `
  select 1 from student_course where student_id =$1 and 
  course_id =$2
  `;
  const cSql = `
  select status,student_limit,current_students from course where id =$1 for update
  `;
  const jSql = `
  insert into student_course (student_id,course_id)
  values ($1, $2) on conflict do nothing
  returning 1
  `;
  const uSql = `
  update course set
  current_students = least(student_limit,current_students + 1)
  where id = any($1::int[])
  `;
  let result = {
    joins: [],
    skips: [],
  };
  let validIds = [];
  try {
    const sRes = await db.query(sSql, [sId]);
    if (sRes.rowCount !== 1) {
      throw new ApiError(403, `Student id=${sId} is Inactive`);
    }
    for (let c of cIds) {
      const eRes = await db.query(eSql, [sId, c]);
      if (eRes.rowCount === 1) {
        result.skips.push({ cId: c, reason: "Skip for already joined!" });
        continue;
      }
      const cRes = await db.query(cSql, [c]);
      if (cRes.rowCount !== 1) {
        result.skips.push({ cId: c, reason: "Not found!" });
        continue;
      }
      const co = cRes.rows[0];
      if (co.status !== true) {
        result.skips.push({ cId: c, reason: "Skip for status Inactive!" });
        continue;
      }
      if (co.current_students >= co.student_limit) {
        result.skips.push({ cId: c, reason: "Skip for limit reached!" });
        continue;
      }
      const jRes = await db.query(jSql, [sId, c]);
      if (jRes.rowCount !== 1) {
        result.skips.push({
          sId: sId,
          cId: c,
          reason: "Skip for Failed to joined!",
        });
        continue;
      }
      result.joins.push({ cId: c });
      validIds.push(c);
    }
    if (validIds.length > 0) {
      await db.query(uSql, [validIds]);
    }
    return result;
  } catch (e) {
    throw new ApiError(e.status, e.message);
  }
}

module.exports = {
  getGender,
  getJoinStudents,
  getJoinStudentsQuery,
  newStudents,
  updateStudent,
  studentExist,
  getJoinStudentId,
  deleteS,
  joinCourses,
};
