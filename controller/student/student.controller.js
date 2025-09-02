const db = require("../../config/db");

async function getGender() {
  const sql = "select * from gender";

  const result = await db.query(sql);
  return result.rows;
}

async function getJoinStudents() {
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
    'course_status',c.status,
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
    order by s.created_at
    `;
  const results = await db.query(sql);
  return results.rows;
}

async function getJoinStudentsQuery(query) {
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
    'course_status',c.status,
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
    order by s.created_at
    `;
  const results = await db.query(sql, [pattern]);
  return results.rows;
}

module.exports = { getGender, getJoinStudents, getJoinStudentsQuery };
