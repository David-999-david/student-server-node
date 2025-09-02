const db = require("../../config/db");

async function getJoinCourses() {
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
    'status',s.status
    )
    order by s.created_at
    ) filter (where s.id is not null),
     '[]'::jsonb
    ) as students
    from course c
    left join student_course sc on sc.course_id = c.id
    left join student s on s.id = sc.student_id
    group by c.id,c.name,c.description,
    c.status,c.student_limit,c.current_students,c.start_date,
    c.end_date,c.created_at
    order by c.created_at
    `;

  const results = await db.query(sql);
  return results.rows;
}

async function getJoinCoursesQuery(query) {
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
    'status',s.status
    )
    order by s.created_at
    ) filter (where s.id is not null),
     '[]'::jsonb
    ) as students
    from course c
    left join student_course sc on sc.course_id = c.id
    left join student s on s.id = sc.student_id
    where c.name ilike $1
    group by c.id,c.name,c.description,
    c.status,c.student_limit,c.current_students,c.start_date,
    c.end_date,c.created_at
    order by c.created_at
    `;

  const results = await db.query(sql, [pattern]);
  return results.rows;
}

module.exports = { getJoinCourses, getJoinCoursesQuery };
