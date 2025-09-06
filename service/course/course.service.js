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
  const countRes = await db.query(countsql,[pattern]);
  
  return { courses: results.rows, count: countRes.rows[0].total };
}

async function addCourse(c) {
  const sql = 
  `insert into course
  (name,description,status,student_limit,start_date,end_date)
  values
  ($1,$2,$3,$4,$5,$6)
  returning *
  `
  try {
    const res = await db.query(
      sql,
      [
        c.name,
        c.description,
        c.status,
        c.student_limit,
        c.start_date,
        c.end_date
      ]
    );
    if (res.rowCount != 1){
      throw new ApiError(500, "Error when insert new course")
    }
    return res.rows[0];
  } 
  catch (e){
    throw new ApiError(e.status || 500, e.message || 'Db Error');
  }
}

module.exports = { getJoinCourses, getJoinCoursesQuery, addCourse };
