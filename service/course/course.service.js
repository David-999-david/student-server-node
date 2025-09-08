const db = require("../../config/db");
const ApiError = require("../../utils/ApiError");

async function getJoinCourses(limit, offset) {
  const sql = `
    select
    c.id,
    c.name,
    c.description,
    c.status,
    c.student_limit,
    c.current_students,
    c.start_date,
    c.end_date,
    c.created_at,
    coalesce(
    jsonb_agg(
    jsonb_build_object(
    'id',s.id,
    'name',s.name,
    'email',s.email,
    'address',s.address,
    'phone',s.phone,
    'status',s.status,
        'created_at',s.created_at,
    'gender',g.name
    )
    order by s.created_at
    ) filter (where s.id is not null),
     '[]'::jsonb
    ) as students
    from course c
    left join student_course sc on sc.course_id = c.id
    left join student s on s.id = sc.student_id
    left join gender g on g.id = s.gender_id
    group by c.id,c.name,c.description,
    c.status,c.student_limit,c.current_students,c.start_date,
    c.end_date,c.created_at
    order by c.created_at desc
    limit $1 offset $2
    `;
  const results = await db.query(sql, [limit, offset]);

  const countsql = `select count(*)::int as total from course`;
  const countRes = await db.query(countsql);
  return { courses: results.rows, count: countRes.rows[0].total };
}

async function getJoinCoursesQuery(query, limit, offset) {
  const pattern = `%${query}%`;
  const sql = `
    select
    c.id,
    c.name,
    c.description,
    c.status,
    c.student_limit,
    c.current_students,
    c.start_date,
    c.end_date,
    c.created_at,
    coalesce(
    jsonb_agg(
    jsonb_build_object(
    'id',s.id,
    'name',s.name,
    'email',s.email,
    'address',s.address,
    'phone',s.phone,
    'status',s.status,
    'created_at',s.created_at,
    'gender',g.name
    )
    order by s.created_at
    ) filter (where s.id is not null),
     '[]'::jsonb
    ) as students
    from course c
    left join student_course sc on sc.course_id = c.id
    left join student s on s.id = sc.student_id
    left join gender g on g.id = s.gender_id
    where c.name ilike $1
    group by c.id,c.name,c.description,
    c.status,c.student_limit,c.current_students,c.start_date,
    c.end_date,c.created_at
    order by c.created_at desc
    limit $2 offset $3
    `;

  const results = await db.query(sql, [pattern, limit, offset]);

  const countsql = `select count(*)::int as total from course where name ilike $1`;
  const countRes = await db.query(countsql, [pattern]);

  return { courses: results.rows, count: countRes.rows[0].total };
}

async function addCourse(c) {
  const sql = `insert into course
  (name,description,status,student_limit,start_date,end_date)
  values
  ($1,$2,$3,$4,$5,$6)
  returning *
  `;
  try {
    const res = await db.query(sql, [
      c.name,
      c.description,
      c.status,
      c.student_limit,
      c.start_date,
      c.end_date,
    ]);
    if (res.rowCount != 1) {
      throw new ApiError(500, "Error when insert new course");
    }
    return res.rows[0];
  } catch (e) {
    throw new ApiError(e.status || 500, e.message || "Db Error");
  }
}

async function getIdC(id) {
  const sql = `
  select
  c.id,
  c.name,
  c.description,
  c.status,
  c.student_limit,
  c.current_students,
  c.start_date,
  c.end_date,
  c.created_at,
  coalesce(
  jsonb_agg(
  jsonb_build_object(
  'id',s.id,
  'name',s.name,
  'email',s.email,
  'address',s.address,
  'phone',s.phone,
  'status',s.status,
  'created_at',s.created_at,
  'gender',g.name
  )
  ) filter (where s.id is not null),
   '[]'::jsonb
  ) as students
  from course c
  left join student_course sc on sc.course_id = c.id
  left join student s on s.id = sc.student_id
  left join gender g on g.id = s.gender_id
  where c.id = $1
  group by c.id,c.name,c.description,c.status,c.student_limit,c.current_students,c.start_date,c.end_date,c.created_at
  `;
  try {
    const res = await db.query(sql, [id]);
    if (res.rowCount != 1) {
      throw new ApiError(404, `Not found course with id=${id}`);
    }
    return res.rows[0];
  } catch (e) {
    throw new ApiError(e.status || 500, e.message || "Course get id Db Error");
  }
}

async function updateC(id, course) {
  const sql = `
  update course set
  name = coalesce(nullif($1,''),name),
  description = coalesce(nullif($2,''),description),
  status = coalesce($3,status),
  student_limit = coalesce($4,student_limit),
  start_date = coalesce($5,start_date),
  end_date = coalesce($6,end_date),
  updated_at = now()
  where id = $7
  returning *
  `;
  try {
    const result = await db.query(sql, [
      course.name,
      course.description,
      course.status,
      course.student_limit,
      course.start_date,
      course.end_date,
      id,
    ]);
    if (result.rowCount === 0) {
      throw new ApiError(404, `Course with id=${id} not found!`);
    }
    return result.rows[0];
  } catch (e) {
    throw new ApiError(
      e.status || 500,
      e.message || "Error when update course"
    );
  }
}

async function deleteC(id) {
  const sql = `delete from course where id =$1`;
  try {
    await db.query(sql, [id]);
  } catch (e) {
    throw new ApiError(e.status || 500, e.message || "Internal Server Error");
  }
}

async function joinSIds(cId, sIds) {
  const cSql = `
  select student_limit,current_students
  from course where id=$1
  and status = true
  `;
  const eSql = `select 1 from student_course where
  course_id = $1 and student_id = $2
  `;
  const sSql = `select 1 from student where id=$1 and status=true`;
  const jSql = `
  insert into student_course
  (student_id,course_id)
  values
  ($1, $2)
  on conflict do nothing
  `;
  const uSql = `
  update course set
  current_students = least(student_limit,current_students + $2),
  updated_at = now()
  where id = $1
  `;
  let result = {
    joins: [],
    skips: [],
    courseFull: false,
  };
  try {
    const checkRes = await db.query(cSql, [cId]);
    if (checkRes.rowCount !== 1) {
      throw new ApiError(403, `Course with id=${cId} of stuats is Inactive`);
    }
    const { student_limit, current_students } = checkRes.rows[0];
    let remaining = student_limit - current_students;
    if (remaining <= 0) {
      result.courseFull = true;
      return result;
    }
    let joinCount = 0;
    for (let i of sIds) {
      if (remaining === 0) {
        result["courseFull"] = true;
        result["skips"].push({
          sId: i,
          reason: `Student id=${i} cannot join for Course id=${cId} courseFull`,
        });
        break;
      }
      const eRes = await db.query(eSql, [cId, i]);
      if (eRes.rowCount === 1) {
        result["skips"].push({
          sId: i,
          reason: `Student id${i} is already join to Course id${cId}`,
        });
        continue;
      }
      const sRes = await db.query(sSql, [i]);
      if (sRes.rowCount !== 1) {
        result["skips"].push({
          sId: i,
          reason: `Student id=${i} of status is inactive`,
        });
        continue;
      }
      const jRes = await db.query(jSql, [i, cId]);
      if (jRes.rowCount !== 1) {
        result["skips"].push({
          sId: i,
          reason: `Failed to join student id=${i} to Course id=${cId}`,
        });
        continue;
      }
      result["joins"].push({
        sId: i,
      });
      remaining -= 1;
      joinCount += 1;
    }
    if (joinCount > 0) {
      await db.query(uSql, [cId, joinCount]);
    }
    return result;
  } catch (e) {
    throw new ApiError(
      e.status || 500,
      e.message ||
        `Error when 
      students join with Course with id=${cId}
      `
    );
  }
}

async function cancelJoinCourse(cId, sId) {
  const eSql = `select 1 from student_course
  where student_id=$1 and course_id=$2
  `;
  const cSql = `
  delete from student_course
  where student_id=$1 and course_id=$2
  `;
  const dSql = `
  update course set
  current_students = greatest(1,current_students -1),
  updated_at = now()
  where id = $1
  returning 1
  `;
  try {
    const eRes = await db.query(eSql, [sId, cId]);
    if (eRes.rowCount !== 1) {
      throw new ApiError(
        404,
        `Can't find student id=${sId} join with course id=${cId}`
      );
    }
    const cRes = await db.query(cSql, [sId, cId]);
    if (cRes.rowCount !== 1) {
      throw new ApiError(
        500,
        `Failed to 
      cancel join student id=${sId} with course id=${cId}`
      );
    }
    const dRes = await db.query(dSql, [cId]);
    if (dRes.rowCount !== 1) {
      throw new ApiError(
        500,
        `Failed to decrease current students in course with id=${cId}
        when cancel join with student id=${sId}
        `
      );
    }
  } catch (e) {
    throw new ApiError(
      e.status || 500,
      e.message ||
        `Error when 
      cancel join student id=${sId} with course id=${cId}
      `
    );
  }
}

module.exports = {
  getJoinCourses,
  getJoinCoursesQuery,
  addCourse,
  getIdC,
  updateC,
  deleteC,
  joinSIds,
  cancelJoinCourse,
};
